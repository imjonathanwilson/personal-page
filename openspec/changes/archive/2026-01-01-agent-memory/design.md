# Agent Memory MCP Server - Technical Design

## Technology Stack Decision

### Framework Selection: Fast MCP (Python)

**Decision**: Use Fast MCP (Python) over Node.js MCP SDK

**Rationale**:
- **Simplicity**: Fast MCP provides a cleaner, more Pythonic API with decorators
- **Performance**: Python's async/await is mature and performant for I/O-bound operations
- **Ecosystem**: Better access to ML/AI libraries if we add semantic search later
- **Development Speed**: Less boilerplate, faster iteration
- **Deployment**: Single Python file deployment is simpler than Node.js packaging

**Trade-offs**:
- Node.js might have slightly better cold-start performance
- TypeScript provides better compile-time safety
- These are outweighed by Python's advantages for this use case

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│         Claude Code (MCP Client)        │
│                                         │
│  Calls: store_memory, query_memories    │
└────────────────┬────────────────────────┘
                 │ stdio
                 │
┌────────────────▼────────────────────────┐
│      Agent Memory MCP Server            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Memory Manager                 │   │
│  │  - Store memories               │   │
│  │  - Query memories               │   │
│  │  - Update memories              │   │
│  │  - Archive memories             │   │
│  └────────────┬────────────────────┘   │
│               │                         │
│  ┌────────────▼────────────────────┐   │
│  │  Storage Layer                  │   │
│  │  - JSON file I/O                │   │
│  │  - Atomic writes                │   │
│  │  - File locking                 │   │
│  └────────────┬────────────────────┘   │
└───────────────┼─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│  ~/.claude/agents/memories/             │
│  ├── core_memories.json                 │
│  ├── learnings.json                     │
│  ├── tasks.json                         │
│  └── index.json (metadata)              │
└─────────────────────────────────────────┘
```

### Data Model

#### Memory Structure

```json
{
  "id": "uuid-v4",
  "type": "core|learning|task",
  "content": "The actual memory content",
  "category": "preference|fact|pattern|...",
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-01T10:00:00Z",
  "accessed_at": "2026-01-01T10:00:00Z",
  "access_count": 5,
  "tags": ["python", "testing", "preferences"],
  "importance": "high|medium|low",
  "archived": false
}
```

#### Core Memories (`core_memories.json`)
- User preferences (coding style, tools, patterns)
- Project-specific facts
- Long-term patterns and behaviors
- Size limit: 1000 memories (with archival)

#### Learnings (`learnings.json`)
- Insights from recent sessions
- New patterns discovered
- Solutions to problems
- Automatically archived after 90 days of inactivity
- Size limit: 500 learnings

#### Tasks (`tasks.json`)
- Completed tasks with outcomes
- In-progress tasks with context
- Blocked tasks with blockers
- Automatically archived after 30 days of completion
- Size limit: 200 tasks

### Storage Strategy

#### File Format: JSON Lines (JSONL)
Each file contains one JSON object per line for:
- Easy appending without parsing entire file
- Simpler recovery from partial corruption
- Line-by-line streaming for large files

Example `core_memories.json`:
```jsonl
{"id":"mem-001","type":"core","content":"User prefers pytest over unittest","category":"preference","created_at":"2026-01-01T10:00:00Z","updated_at":"2026-01-01T10:00:00Z","accessed_at":"2026-01-01T10:00:00Z","access_count":5,"tags":["testing","python"],"importance":"high","archived":false}
{"id":"mem-002","type":"core","content":"Project uses black for code formatting","category":"fact","created_at":"2026-01-01T10:05:00Z","updated_at":"2026-01-01T10:05:00Z","accessed_at":"2026-01-01T10:05:00Z","access_count":3,"tags":["formatting","python"],"importance":"medium","archived":false}
```

#### Directory Structure
```
~/.claude/agents/memories/
├── core_memories.jsonl       # Core persistent memories
├── learnings.jsonl           # Recent learnings
├── tasks.jsonl               # Task history
├── archive/                  # Archived memories
│   ├── core_memories_2025.jsonl
│   ├── learnings_2025.jsonl
│   └── tasks_2025.jsonl
├── index.json                # Metadata and indexes
└── .lock                     # File lock for concurrent access
```

#### Index File (`index.json`)
```json
{
  "version": "1.0.0",
  "last_updated": "2026-01-01T10:00:00Z",
  "statistics": {
    "total_memories": 1500,
    "core_memories": 1000,
    "learnings": 400,
    "tasks": 100
  },
  "tags_index": {
    "python": ["mem-001", "mem-002"],
    "testing": ["mem-001"]
  }
}
```

### MCP Server Interface

#### Tools

##### 1. `store_memory`
Store a new memory or update an existing one.

**Parameters**:
```typescript
{
  type: "core" | "learning" | "task",
  content: string,
  category?: string,
  tags?: string[],
  importance?: "high" | "medium" | "low",
  id?: string  // For updates
}
```

**Returns**: Memory ID

##### 2. `query_memories`
Query memories with filtering and sorting.

**Parameters**:
```typescript
{
  type?: "core" | "learning" | "task",
  tags?: string[],
  search?: string,  // Text search in content
  importance?: "high" | "medium" | "low",
  limit?: number,   // Default 10
  offset?: number,  // For pagination
  sort_by?: "created_at" | "accessed_at" | "importance",
  sort_order?: "asc" | "desc"
}
```

**Returns**: Array of memories

##### 3. `update_memory`
Update an existing memory.

**Parameters**:
```typescript
{
  id: string,
  content?: string,
  tags?: string[],
  importance?: "high" | "medium" | "low",
  archived?: boolean
}
```

**Returns**: Updated memory

##### 4. `delete_memory`
Delete or archive a memory.

**Parameters**:
```typescript
{
  id: string,
  permanent?: boolean  // Default false (archives instead)
}
```

**Returns**: Success confirmation

##### 5. `get_memory_stats`
Get statistics about stored memories.

**Returns**:
```typescript
{
  total_memories: number,
  by_type: { core: number, learning: number, task: number },
  by_importance: { high: number, medium: number, low: number },
  total_storage_kb: number,
  oldest_memory: string,
  newest_memory: string
}
```

#### Resources

##### 1. `memory://recent`
Recent memories across all types (last 20).

##### 2. `memory://core`
All core memories.

##### 3. `memory://learnings`
Recent learnings (last 30 days).

##### 4. `memory://tasks/active`
Active (non-archived) tasks.

### Implementation Details

#### Concurrency and Safety

1. **File Locking**: Use `fcntl.flock` (Unix) / `msvcrt.locking` (Windows) for exclusive access
2. **Atomic Writes**: Write to temp file, then atomic rename
3. **Validation**: JSON schema validation before writes
4. **Backup**: Automatic backup before destructive operations

#### Performance Optimizations

1. **Lazy Loading**: Load only requested memory types
2. **Caching**: In-memory cache with LRU eviction
3. **Index**: Maintain tag index for fast filtering
4. **Pagination**: Support offset/limit for large result sets

#### Error Handling

1. **Corruption Recovery**: Auto-repair from backup if main file corrupted
2. **Validation Errors**: Clear error messages with correction hints
3. **Storage Limits**: Graceful handling with archival suggestions
4. **Permissions**: Clear error if directory not writable

### Configuration

#### MCP Server Config (`~/.claude/mcp-config.json`)

```json
{
  "mcpServers": {
    "agent-memory": {
      "command": "python",
      "args": ["-m", "agent_memory_server"],
      "env": {
        "MEMORY_DIR": "~/.claude/agents/memories",
        "MAX_CORE_MEMORIES": "1000",
        "MAX_LEARNINGS": "500",
        "MAX_TASKS": "200",
        "AUTO_ARCHIVE_LEARNINGS_DAYS": "90",
        "AUTO_ARCHIVE_TASKS_DAYS": "30"
      }
    }
  }
}
```

#### Environment Variables

- `MEMORY_DIR`: Base directory for memory storage (default: `~/.claude/agents/memories`)
- `MAX_CORE_MEMORIES`: Maximum core memories before archival required (default: 1000)
- `MAX_LEARNINGS`: Maximum learnings before auto-archival (default: 500)
- `MAX_TASKS`: Maximum tasks before auto-archival (default: 200)
- `AUTO_ARCHIVE_LEARNINGS_DAYS`: Days before learnings auto-archive (default: 90)
- `AUTO_ARCHIVE_TASKS_DAYS`: Days after completion before tasks auto-archive (default: 30)
- `LOG_LEVEL`: Logging verbosity (default: INFO)

### Testing Strategy

1. **Unit Tests**: Test each memory operation in isolation
2. **Integration Tests**: Test MCP protocol communication
3. **Concurrency Tests**: Test file locking and concurrent access
4. **Performance Tests**: Benchmark with large memory sets
5. **Corruption Tests**: Test recovery from various corruption scenarios

### Security Considerations

1. **Local Only**: All data stored locally, no network access
2. **File Permissions**: Restrict memory files to user-only read/write (0600)
3. **Input Validation**: Sanitize all inputs to prevent injection
4. **Size Limits**: Prevent denial-of-service via memory exhaustion
5. **Sensitive Data**: Document that users should avoid storing secrets

### Future Enhancements

1. **Semantic Search**: Vector embeddings for similarity-based search
2. **Memory Consolidation**: LLM-based memory merging and summarization
3. **Cloud Sync**: Optional encrypted cloud backup
4. **Multi-Agent**: Isolated memory spaces per agent
5. **Export/Import**: Portable memory format for migration
