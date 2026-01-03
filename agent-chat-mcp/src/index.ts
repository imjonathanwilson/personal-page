#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  connect,
  JetStreamClient,
  NatsConnection,
  RetentionPolicy,
  StorageType,
  DeliverPolicy,
  AckPolicy
} from "nats";

// Channel definitions
const CHANNELS = {
  roadmap: "Agent roadmap discussions and planning",
  coordination: "Parallel work coordination and task distribution",
  errors: "Error reporting and debugging discussions",
} as const;

type ChannelName = keyof typeof CHANNELS;

// State management
let agentHandle: string | null = null;
let nc: NatsConnection | null = null;
let js: JetStreamClient | null = null;

// NATS connection string (can be configured via env)
const NATS_URL = process.env.NATS_URL || "nats://localhost:4222";

async function initNATS() {
  if (nc && !nc.isClosed()) {
    return;
  }

  try {
    nc = await connect({ servers: NATS_URL });
    js = nc.jetstream();

    // Create streams for each channel
    const jsm = await nc.jetstreamManager();

    for (const channel of Object.keys(CHANNELS)) {
      const streamName = `AGENT_CHAT_${channel.toUpperCase()}`;
      const streamConfig = {
        name: streamName,
        subjects: [`agent.chat.${channel}`],
        retention: RetentionPolicy.Limits,
        max_msgs: 10000,
        max_age: 7 * 24 * 60 * 60 * 1_000_000_000, // 7 days in nanoseconds
        storage: StorageType.File,
      };

      try {
        await jsm.streams.add(streamConfig);
      } catch (err: any) {
        // Stream might already exist, try to get it
        if (err.message?.includes("already in use")) {
          await jsm.streams.info(streamName);
        } else {
          throw err;
        }
      }
    }
  } catch (error: any) {
    console.error("Failed to connect to NATS:", error.message);
    throw new Error(`NATS connection failed: ${error.message}`);
  }
}

async function postMessage(channel: ChannelName, message: string) {
  if (!agentHandle) {
    throw new Error("No handle set. Use set_handle tool first.");
  }

  if (!js) {
    await initNATS();
  }

  const msg = {
    handle: agentHandle,
    message,
    timestamp: new Date().toISOString(),
    channel,
  };

  await js!.publish(`agent.chat.${channel}`, new TextEncoder().encode(JSON.stringify(msg)));
  return msg;
}

async function readMessages(channel: ChannelName, limit: number = 50) {
  if (!js) {
    await initNATS();
  }

  const streamName = `AGENT_CHAT_${channel.toUpperCase()}`;
  const messages: any[] = [];

  try {
    const jsm = await nc!.jetstreamManager();
    const consumerName = `reader-${Date.now()}`;

    await jsm.consumers.add(streamName, {
      name: consumerName,
      deliver_policy: DeliverPolicy.All,
      ack_policy: AckPolicy.None,
      max_deliver: 1,
    });

    const consumer = await js!.consumers.get(streamName, consumerName);
    const msgs = await consumer.fetch({ max_messages: limit, expires: 5000 });

    for await (const m of msgs) {
      try {
        const data = JSON.parse(new TextDecoder().decode(m.data));
        messages.push(data);
      } catch (e) {
        // Skip invalid messages
      }
    }

    // Clean up ephemeral consumer
    try {
      await jsm.consumers.delete(streamName, consumerName);
    } catch (e) {
      // Ignore cleanup errors
    }
  } catch (error: any) {
    if (error.message?.includes("stream not found")) {
      // Stream doesn't exist yet, return empty array
      return [];
    }
    throw error;
  }

  return messages;
}

// Create MCP server
const server = new Server(
  {
    name: "agent-chat",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "set_handle",
        description: "Set your agent handle/username for chat. This identifies you in all messages.",
        inputSchema: {
          type: "object",
          properties: {
            handle: {
              type: "string",
              description: "Your agent handle (username)",
            },
          },
          required: ["handle"],
        },
      },
      {
        name: "post_message",
        description: "Post a message to a channel. Requires handle to be set first.",
        inputSchema: {
          type: "object",
          properties: {
            channel: {
              type: "string",
              enum: Object.keys(CHANNELS),
              description: `Channel to post to: ${Object.entries(CHANNELS)
                .map(([k, v]) => `${k} (${v})`)
                .join(", ")}`,
            },
            message: {
              type: "string",
              description: "Message content to post",
            },
          },
          required: ["channel", "message"],
        },
      },
      {
        name: "read_messages",
        description: "Read recent messages from a channel",
        inputSchema: {
          type: "object",
          properties: {
            channel: {
              type: "string",
              enum: Object.keys(CHANNELS),
              description: `Channel to read from: ${Object.entries(CHANNELS)
                .map(([k, v]) => `${k} (${v})`)
                .join(", ")}`,
            },
            limit: {
              type: "number",
              description: "Maximum number of messages to retrieve (default: 50)",
              default: 50,
            },
          },
          required: ["channel"],
        },
      },
      {
        name: "list_channels",
        description: "List all available chat channels",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_handle",
        description: "Get your current agent handle",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "set_handle": {
        const { handle } = args as { handle: string };
        agentHandle = handle;
        return {
          content: [
            {
              type: "text",
              text: `Handle set to: ${handle}`,
            },
          ],
        };
      }

      case "get_handle": {
        return {
          content: [
            {
              type: "text",
              text: agentHandle ? `Current handle: ${agentHandle}` : "No handle set",
            },
          ],
        };
      }

      case "post_message": {
        const { channel, message } = args as { channel: ChannelName; message: string };
        const msg = await postMessage(channel, message);
        return {
          content: [
            {
              type: "text",
              text: `Message posted to #${channel} by ${msg.handle} at ${msg.timestamp}`,
            },
          ],
        };
      }

      case "read_messages": {
        const { channel, limit = 50 } = args as { channel: ChannelName; limit?: number };
        const messages = await readMessages(channel, limit);

        const formatted = messages.length > 0
          ? messages
              .map((m) => `[${m.timestamp}] ${m.handle}: ${m.message}`)
              .join("\n")
          : `No messages in #${channel} yet`;

        return {
          content: [
            {
              type: "text",
              text: `=== #${channel} (${messages.length} messages) ===\n${formatted}`,
            },
          ],
        };
      }

      case "list_channels": {
        const channelList = Object.entries(CHANNELS)
          .map(([name, desc]) => `• #${name}: ${desc}`)
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text: `Available channels:\n${channelList}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  try {
    // Initialize NATS connection
    await initNATS();

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("Agent Chat MCP server running on stdio");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Cleanup on exit
process.on("SIGINT", async () => {
  if (nc) {
    await nc.close();
  }
  process.exit(0);
});

main();
