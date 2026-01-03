# Storage Format Specification - Agent Memory Server

## Overview

This document specifies the file system storage format for agent memories. The design prioritizes simplicity, human-readability, and robustness.

## Directory Structure

```
~/.claude/agents/memories/
├── core_memories.jsonl       # Core persistent memories
├── learnings.jsonl           # Recent learnings and insights
├── tasks.jsonl               # Task history
├── index.json                # Metadata and search indexes
├── .lock                     # File lock for concurrent access
├── .backup/                  # Automatic backups
│   ├── core_memories.jsonl.backup
│   ├── learnings.jsonl.backup
│   └── tasks.jsonl.backup
└── archive/                  # Archived memories
    ├── 2025/
    │   ├── core_memories_2025_Q4.jsonl
    │   ├── learnings_2025_Q4.jsonl
    │   └── tasks_2025_Q4.jsonl
    └── 2026/
        └── ...
```

## File Format: JSONL (JSON Lines)

### Why JSONL?

- **Appendable**: New memories can be appended without parsing the entire file
- **Recoverable**: Partial corruption affects only individual lines, not entire file
- **Streamable**: Can process line-by-line for large datasets
- **Human-readable**: Each line is valid JSON, easy to inspect and edit
- **Simple**: No complex database schema or query language

### Format Specification

Each file contains one JSON object per line. Each line is a complete, valid JSON object terminated by a newline (`\n`).

**Rules**:
1. One memory object per line
2. No line breaks within JSON objects (minified JSON)
3. Lines separated by single newline character
4. UTF-8 encoding
5. No trailing newline at end of file
6. Maximum line length: 10KB (enforced by content length limit)

### Example File Content

`core_memories.jsonl`:
```jsonl
{"id":"550e8400-e29b-41d4-a716-446655440000","type":"core","content":"User prefers pytest over unittest","category":"preference","created_at":"2026-01-01T10:00:00Z","updated_at":"2026-01-01T10:00:00Z","accessed_at":"2026-01-01T10:00:00Z","access_count":5,"tags":["python","testing"],"importance":"high","archived":false}
{"id":"550e8400-e29b-41d4-a716-446655440001","type":"core","content":"Project uses black for formatting with line length 88","category":"fact","created_at":"2026-01-01T10:05:00Z","updated_at":"2026-01-01T10:05:00Z","accessed_at":"2026-01-01T10:05:00Z","access_count":3,"tags":["python","formatting","black"],"importance":"medium","archived":false}
```

## Memory Object Schema

### Base Schema

All memory objects share this base structure:

```typescript
{
  id: string;              // UUID v4
  type: "core" | "learning" | "task";
  content: string;         // 1-5000 characters
  category?: string;       // Optional, max 50 chars
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
  accessed_at: string;     // ISO 8601 timestamp
  access_count: number;    // >= 0
  tags: string[];          // Array of strings, max 10 tags, each max 30 chars
  importance: "high" | "medium" | "low";
  archived: boolean;
}
```

### Task-Specific Extensions

Task memories may include additional metadata:

```typescript
{
  // ... base fields
  type: "task",
  task_metadata?: {
    status: "completed" | "in-progress" | "blocked";
    completed_at?: string;    // ISO 8601, present if status=completed
    blockers?: string[];       // Present if status=blocked
    outcome?: string;          // Description of outcome for completed tasks
  }
}
```

### Field Constraints

| Field | Type | Constraints |
|-------|------|-------------|
| id | string | UUID v4 format |
| type | enum | "core", "learning", or "task" |
| content | string | 1-5000 characters, non-empty |
| category | string | Optional, max 50 characters |
| created_at | string | ISO 8601 with timezone |
| updated_at | string | ISO 8601 with timezone |
| accessed_at | string | ISO 8601 with timezone |
| access_count | number | Integer >= 0 |
| tags | array | 0-10 strings, each max 30 chars |
| importance | enum | "high", "medium", or "low" |
| archived | boolean | true or false |

## Index File Format

`index.json` contains metadata and search indexes:

```json
{
  "version": "1.0.0",
  "last_updated": "2026-01-01T10:00:00Z",
  "statistics": {
    "total_memories": 1500,
    "by_type": {
      "core": 1000,
      "learning": 400,
      "task": 100
    },
    "archived_count": 2500,
    "total_storage_bytes": 2048576
  },
  "tags_index": {
    "python": ["550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440001"],
    "testing": ["550e8400-e29b-41d4-a716-446655440000"]
  },
  "category_index": {
    "preference": ["550e8400-e29b-41d4-a716-446655440000"],
    "fact": ["550e8400-e29b-41d4-a716-446655440001"]
  },
  "importance_index": {
    "high": ["550e8400-e29b-41d4-a716-446655440000"],
    "medium": ["550e8400-e29b-41d4-a716-446655440001"],
    "low": []
  }
}
```

### Index Update Strategy

- Index is rebuilt on server startup
- Index is updated incrementally on write operations
- Full rebuild triggered if index version mismatches
- Index corruption triggers automatic rebuild from memory files

## File Operations

### Reading

1. Open file for reading
2. Read line-by-line
3. Parse each line as JSON
4. Validate against schema
5. Skip invalid lines with warning log
6. Return valid memory objects

### Writing (Append)

1. Acquire file lock (`.lock` file)
2. Validate memory object
3. Serialize to minified JSON
4. Append to file with newline
5. Update index
6. Release file lock

### Updating

1. Acquire file lock
2. Read all memories into memory
3. Update target memory in memory
4. Create backup (`file.jsonl.backup`)
5. Write all memories to temp file (`file.jsonl.tmp`)
6. Atomic rename: `file.jsonl.tmp` → `file.jsonl`
7. Update index
8. Release file lock

### Deleting (Archival)

1. Acquire file lock
2. Read all memories
3. Mark memory as `archived: true` or remove from list
4. If archived, move to archive directory
5. Write updated list
6. Update index
7. Release file lock

## Concurrency Control

### Lock File (`.lock`)

- Created when write operation begins
- Contains PID and timestamp
- Deleted when operation completes
- Stale lock detection: >30 seconds old with dead PID

### Lock Acquisition

```python
import fcntl  # Unix
import msvcrt  # Windows

# Unix
fd = open('.lock', 'w')
fcntl.flock(fd, fcntl.LOCK_EX)  # Blocking exclusive lock

# Windows
fd = open('.lock', 'w')
msvcrt.locking(fd.fileno(), msvcrt.LK_LOCK, 1)
```

### Lock Release

```python
# Unix
fcntl.flock(fd, fcntl.LOCK_UN)
fd.close()
os.remove('.lock')

# Windows
msvcrt.locking(fd.fileno(), msvcrt.LK_UNLCK, 1)
fd.close()
os.remove('.lock')
```

## Backup Strategy

### Automatic Backups

- Before any destructive operation (update, delete)
- Backup stored in `.backup/` directory
- Max 5 backups per file type (rotate oldest)
- Backup file naming: `<type>_memories.jsonl.backup.<timestamp>`

### Backup Restoration

```bash
# Manual restoration
cp ~/.claude/agents/memories/.backup/core_memories.jsonl.backup.20260101_100000 \
   ~/.claude/agents/memories/core_memories.jsonl
```

### Archival

- Quarterly archival of old memories
- Archive naming: `<type>_memories_<YEAR>_Q<N>.jsonl`
- Learnings: Auto-archive after 90 days of no access
- Tasks: Auto-archive after 30 days post-completion
- Core memories: Manual archival only

## File Permissions

### Unix/Linux/macOS

```bash
chmod 700 ~/.claude/agents/memories/          # drwx------
chmod 600 ~/.claude/agents/memories/*.jsonl    # -rw-------
chmod 600 ~/.claude/agents/memories/index.json # -rw-------
```

### Windows

- ACL: User read/write only
- Remove inheritance
- No other users or groups

## Storage Limits

| File | Max Size | Max Memories | Enforcement |
|------|----------|--------------|-------------|
| core_memories.jsonl | 10 MB | 1000 | Hard limit, require archival |
| learnings.jsonl | 5 MB | 500 | Soft limit, auto-archive old |
| tasks.jsonl | 2 MB | 200 | Soft limit, auto-archive completed |

When limits are reached:
1. Warning logged
2. Oldest/least accessed memories suggested for archival
3. Write operations blocked until space freed (hard limits)
4. Auto-archival triggered (soft limits)

## Validation and Repair

### Validation on Load

1. Check file permissions
2. Verify file is readable
3. Parse line-by-line
4. Validate JSON syntax
5. Validate schema compliance
6. Log warnings for invalid entries
7. Skip invalid entries (don't block load)

### Repair Operations

#### Syntax Errors
- Skip line, log warning with line number
- Suggest manual review and edit

#### Schema Errors
- Attempt automatic correction (e.g., add missing fields with defaults)
- Log warning
- If uncorrectable, skip line

#### Duplicate IDs
- Keep first occurrence
- Log warning
- Suggest manual deduplication

#### Corrupted File
- Attempt line-by-line recovery
- Restore from `.backup/` if available
- Last resort: Rebuild from archive

## Migration and Versioning

### Version Field
`index.json` contains `version` field: `"1.0.0"`

### Future Schema Changes

When schema changes are needed:
1. Increment version number
2. Implement migration function
3. Auto-migrate on server startup
4. Create backup before migration
5. Log migration success/failure

### Example Migration

```python
def migrate_v1_to_v2(memory):
    """Migrate memory from v1.0.0 to v2.0.0"""
    # Add new required field with default
    memory['new_field'] = 'default_value'
    return memory
```

## Performance Characteristics

### Expected Performance

| Operation | Time | Notes |
|-----------|------|-------|
| Append new memory | <5ms | Simple append operation |
| Query with index | <50ms | Using tag/category index |
| Query without index | <200ms | Linear scan, 1000 memories |
| Update memory | <100ms | Read all, update, write all |
| Delete memory | <100ms | Read all, filter, write all |
| Load on startup | <500ms | Load all files, build index |

### Optimization Strategies

1. **Index Usage**: Always prefer indexed queries
2. **Lazy Loading**: Load only needed memory types
3. **Caching**: Keep recently accessed memories in RAM
4. **Batch Writes**: Accumulate writes, flush periodically
5. **Async I/O**: Use async file operations where possible

## Example Implementation Pseudocode

```python
def append_memory(memory: Memory, filepath: Path):
    """Append a new memory to JSONL file"""
    validate_memory(memory)

    with file_lock(filepath.parent / '.lock'):
        # Serialize to minified JSON
        json_line = json.dumps(memory.dict(), separators=(',', ':'))

        # Append to file
        with open(filepath, 'a', encoding='utf-8') as f:
            f.write(json_line + '\n')

        # Update index
        update_index(memory)

def read_memories(filepath: Path) -> List[Memory]:
    """Read all memories from JSONL file"""
    memories = []

    with open(filepath, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            try:
                data = json.loads(line)
                memory = Memory.parse_obj(data)
                memories.append(memory)
            except json.JSONDecodeError as e:
                log.warning(f"Invalid JSON at line {line_num}: {e}")
            except ValidationError as e:
                log.warning(f"Invalid schema at line {line_num}: {e}")

    return memories
```
