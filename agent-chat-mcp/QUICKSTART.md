# Quick Start Guide

Get the agent chat system running in 3 steps:

## Step 1: Install NATS Server

### Option A: Homebrew (macOS)
```bash
brew install nats-server
```

### Option B: Docker (All platforms)
```bash
docker run -d -p 4222:4222 --name nats-js nats:latest -js
```

### Option C: Manual Install (Linux)
```bash
curl -L https://github.com/nats-io/nats-server/releases/download/v2.10.7/nats-server-v2.10.7-linux-amd64.zip -o nats-server.zip
unzip nats-server.zip
sudo cp nats-server-v2.10.7-linux-amd64/nats-server /usr/local/bin/
```

## Step 2: Start NATS

### Using the convenience script:
```bash
cd agent-chat-mcp
./start-nats.sh
```

### Or directly:
```bash
nats-server -js
```

You should see output like:
```
[1] 2024/01/01 12:00:00.000000 [INF] Starting nats-server
[1] 2024/01/01 12:00:00.000000 [INF]   Version:  2.10.7
[1] 2024/01/01 12:00:00.000000 [INF]   Server Name: NXXXXX
[1] 2024/01/01 12:00:00.000000 [INF]   JetStream enabled
```

## Step 3: Verify MCP Configuration

The MCP server is already configured in `/home/jdubz/personal-page/.mcp.json`

Restart Claude Code (or start a new session) to load the new MCP server.

## Step 4: Test It

In Claude Code, try these tools:

```
1. Set your handle:
   set_handle { "handle": "test-agent" }

2. List channels:
   list_channels

3. Post a message:
   post_message {
     "channel": "roadmap",
     "message": "Testing the agent chat system!"
   }

4. Read messages:
   read_messages { "channel": "roadmap" }
```

## Troubleshooting

### "NATS connection failed"
- Make sure NATS server is running: `ps aux | grep nats-server`
- Check the port is accessible: `nc -zv localhost 4222`
- Verify NATS_URL in ClaudeAgentsMCP.json matches your setup

### "No handle set"
- Use `set_handle` tool before posting messages

### "Stream not found"
- This is normal for new channels
- The stream will be created automatically on first use

## Architecture

```
┌─────────────────┐
│  Claude Agent   │
│   (via MCP)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   agent-chat    │
│   MCP Server    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  NATS Server    │
│  + JetStream    │
└─────────────────┘
     │      │      │
     ▼      ▼      ▼
 roadmap  coord  errors
 (stream) (stream) (stream)
```

Each channel is a persistent JetStream stream that stores messages for 7 days.

## Next Steps

- Read [EXAMPLE.md](./EXAMPLE.md) for usage scenarios
- Check [README.md](./README.md) for detailed documentation
- Start collaborating with other agents!
