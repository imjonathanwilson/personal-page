# Agent Memory MCP Server Specification

**Status**: ✅ Implemented (v1.0.0)
**Location**: `scripts/agent_memory_server/`
**Configuration**: `~/.claude/mcp-config.json`
**Archived Change**: [2026-01-01-agent-memory](../changes/archive/2026-01-01-agent-memory/)

## Overview

The Agent Memory MCP Server provides persistent memory capabilities for AI agents across conversation sessions. It enables agents to store and recall:
- **Core Memories**: Long-term facts, preferences, and patterns
- **Learnings**: Recent insights and discoveries
- **Tasks**: Work history and outcomes

## Architecture

```
┌─────────────────────────────────────┐
│      Claude Code (MCP Client)      │
└────────────┬────────────────────────┘
             │ stdio
┌────────────▼────────────────────────┐
│   Agent Memory MCP Server           │
│   ├── __main__.py (MCP handlers)    │
│   └── storage.py (Storage layer)    │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  ~/.claude/agents/memories/         │
│  ├── [agent-id].json                │
│  └── [agent-id].json.backup         │
└─────────────────────────────────────┘
```

## MCP Tools

### 1. recall_context

Recall recent memories from previous sessions.

**Parameters**:
- `agent_id` (optional): Agent identifier (default: "default")
- `limit` (optional): Number of memories to return (default: 20)

**Returns**: Formatted context summary with core memories, learnings, and tasks.

### 2. add_core_memory

Store a core memory about the user, preferences, or persistent patterns.

**Parameters**:
- `content` (required): The memory content
- `agent_id` (optional): Agent identifier
- `category` (optional): Category (e.g., "preference", "fact")
- `tags` (optional): Array of tags
- `importance` (optional): "high", "medium", or "low"

**Returns**: Success message with memory ID.

### 3. add_recent_learning

Store a recent learning, insight, or discovery.

**Parameters**: Same as add_core_memory

**Returns**: Success message with memory ID.

### 4. add_recent_task

Store information about a completed or in-progress task.

**Parameters**: Same as add_core_memory

**Returns**: Success message with memory ID.

## MCP Resources

### memory://recent
Returns the 20 most recently accessed memories across all types.

### memory://stats
Returns statistics about stored memories (total, by type, storage size).

## Storage Format

**Format**: JSON (structured)
**Location**: `~/.claude/agents/memories/[agent-id].json`

```json
{
  "core_memories": [...],
  "learnings": [...],
  "tasks": [...],
  "metadata": {
    "created_at": "ISO-8601",
    "updated_at": "ISO-8601"
  }
}
```

### Memory Object Schema

```typescript
{
  id: string;              // UUID v4
  type: "core" | "learning" | "task";
  content: string;         // 1-5000 characters
  category?: string;       // Optional category
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
  accessed_at: string;     // ISO 8601 timestamp
  access_count: number;    // Access counter
  tags: string[];          // Tags for categorization
  importance: "high" | "medium" | "low";
  archived: boolean;
}
```

## Configuration

### MCP Server Configuration

File: `~/.claude/mcp-config.json`

```json
{
  "mcpServers": {
    "agent-memory": {
      "command": "/path/to/.venv/bin/python",
      "args": ["-m", "agent_memory_server"],
      "cwd": "/path/to/scripts",
      "env": {
        "PYTHONPATH": "/path/to/scripts",
        "MEMORY_DIR": "~/.claude/agents/memories",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

### Environment Variables

- `MEMORY_DIR`: Base directory for memory storage (default: `~/.claude/agents/memories`)
- `LOG_LEVEL`: Logging verbosity (default: INFO)

## Security

- **File Permissions**: 700 for directory, 600 for memory files
- **Local Only**: All data stored locally, no network access
- **Backups**: Automatic backup before modifications
- **File Locking**: Uses fcntl for concurrent access safety

## Storage Operations

### Add Memory
1. Acquire file lock
2. Read existing memories
3. Add new memory to appropriate array
4. Create backup
5. Write atomically (temp file + rename)
6. Release lock

### Recall Context
1. Acquire file lock
2. Read all memories
3. Update access timestamps
4. Write updated file
5. Release lock
6. Return formatted context

## Implementation Details

**Language**: Python 3.8+
**Framework**: Fast MCP (mcp>=0.9.0)
**Lines of Code**: ~655 lines
**Dependencies**: mcp (Fast MCP framework)

## Files

- `scripts/agent_memory_server/__init__.py` - Package initialization
- `scripts/agent_memory_server/__main__.py` - MCP server implementation
- `scripts/agent_memory_server/storage.py` - Storage layer
- `scripts/agent_memory_server/requirements.txt` - Dependencies
- `scripts/agent_memory_server/README.md` - User documentation
- `scripts/install-agent-memory.sh` - Installation script

## Installation

```bash
./scripts/install-agent-memory.sh
```

This creates:
1. Memory directory with proper permissions
2. MCP configuration entry
3. Virtual environment setup (if needed)

## Usage Example

```python
# Agent starts session
recall_context(agent_id="default", limit=20)
# Returns context from previous sessions

# Store user preference
add_core_memory(
    content="User prefers pytest over unittest",
    category="preference",
    tags=["python", "testing"],
    importance="high"
)

# Store insight
add_recent_learning(
    content="Fast MCP provides cleaner API than Node.js SDK",
    category="insight",
    tags=["mcp", "architecture"]
)

# Store completed work
add_recent_task(
    content="Implemented agent memory MCP server",
    category="completed",
    tags=["mcp", "implementation"]
)
```

## Future Enhancements (v2.0)

See [archived change](../changes/archive/2026-01-01-agent-memory/tasks.md) for full roadmap:

- JSONL format for better scalability
- Tag-based indexing for faster queries
- Automatic archival of old memories
- Memory update and delete operations
- Semantic search with embeddings
- Memory consolidation
- Cloud sync (optional)
- Multi-agent memory spaces

## References

- [Archived Change Proposal](../changes/archive/2026-01-01-agent-memory/proposal.md)
- [Design Documentation](../changes/archive/2026-01-01-agent-memory/design.md)
- [Implementation Summary](../changes/archive/2026-01-01-agent-memory/IMPLEMENTATION_SUMMARY.md)
- [MCP Tools Spec](../changes/archive/2026-01-01-agent-memory/specs/mcp-tools.md)
- [MCP Resources Spec](../changes/archive/2026-01-01-agent-memory/specs/mcp-resources.md)
- [Storage Format Spec](../changes/archive/2026-01-01-agent-memory/specs/storage-format.md)
- [Configuration Spec](../changes/archive/2026-01-01-agent-memory/specs/configuration.md)
