# MCP Tools Specification - Agent Memory Server

## Overview

This document specifies the MCP tools exposed by the Agent Memory Server. Each tool follows the MCP protocol specification for tool invocation.

## Tool Definitions

### 1. store_memory

Store a new memory or update an existing one.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": ["core", "learning", "task"],
      "description": "Type of memory to store"
    },
    "content": {
      "type": "string",
      "description": "The memory content",
      "minLength": 1,
      "maxLength": 5000
    },
    "category": {
      "type": "string",
      "description": "Optional category (e.g., 'preference', 'fact', 'pattern')",
      "maxLength": 50
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string",
        "maxLength": 30
      },
      "description": "Optional tags for categorization",
      "maxItems": 10
    },
    "importance": {
      "type": "string",
      "enum": ["high", "medium", "low"],
      "description": "Memory importance level",
      "default": "medium"
    },
    "id": {
      "type": "string",
      "description": "Memory ID for updates (omit for new memories)",
      "pattern": "^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$"
    }
  },
  "required": ["type", "content"]
}
```

#### Output Schema

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "UUID of the stored memory"
    },
    "created": {
      "type": "boolean",
      "description": "True if new memory was created, false if existing was updated"
    },
    "memory": {
      "type": "object",
      "description": "The complete stored memory object"
    }
  }
}
```

#### Example Usage

```json
{
  "type": "core",
  "content": "User prefers pytest over unittest for Python testing",
  "category": "preference",
  "tags": ["python", "testing"],
  "importance": "high"
}
```

---

### 2. query_memories

Query and filter stored memories.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": ["core", "learning", "task"],
      "description": "Filter by memory type"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Filter by tags (AND logic)"
    },
    "search": {
      "type": "string",
      "description": "Search text in memory content",
      "maxLength": 200
    },
    "importance": {
      "type": "string",
      "enum": ["high", "medium", "low"],
      "description": "Filter by importance level"
    },
    "category": {
      "type": "string",
      "description": "Filter by category"
    },
    "archived": {
      "type": "boolean",
      "description": "Include archived memories",
      "default": false
    },
    "limit": {
      "type": "integer",
      "description": "Maximum number of results",
      "minimum": 1,
      "maximum": 100,
      "default": 10
    },
    "offset": {
      "type": "integer",
      "description": "Number of results to skip (for pagination)",
      "minimum": 0,
      "default": 0
    },
    "sort_by": {
      "type": "string",
      "enum": ["created_at", "updated_at", "accessed_at", "importance", "access_count"],
      "description": "Field to sort by",
      "default": "accessed_at"
    },
    "sort_order": {
      "type": "string",
      "enum": ["asc", "desc"],
      "description": "Sort order",
      "default": "desc"
    }
  }
}
```

#### Output Schema

```json
{
  "type": "object",
  "properties": {
    "memories": {
      "type": "array",
      "items": {
        "type": "object"
      },
      "description": "Array of matching memories"
    },
    "total": {
      "type": "integer",
      "description": "Total number of matching memories (before pagination)"
    },
    "limit": {
      "type": "integer"
    },
    "offset": {
      "type": "integer"
    },
    "has_more": {
      "type": "boolean",
      "description": "True if more results available"
    }
  }
}
```

#### Example Usage

```json
{
  "tags": ["python"],
  "importance": "high",
  "limit": 5,
  "sort_by": "accessed_at",
  "sort_order": "desc"
}
```

---

### 3. update_memory

Update an existing memory.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "UUID of the memory to update",
      "pattern": "^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$"
    },
    "content": {
      "type": "string",
      "description": "Updated content",
      "minLength": 1,
      "maxLength": 5000
    },
    "category": {
      "type": "string",
      "maxLength": 50
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string",
        "maxLength": 30
      },
      "maxItems": 10
    },
    "importance": {
      "type": "string",
      "enum": ["high", "medium", "low"]
    },
    "archived": {
      "type": "boolean",
      "description": "Archive or unarchive the memory"
    }
  },
  "required": ["id"]
}
```

#### Output Schema

```json
{
  "type": "object",
  "properties": {
    "memory": {
      "type": "object",
      "description": "The updated memory object"
    },
    "updated_fields": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of fields that were updated"
    }
  }
}
```

---

### 4. delete_memory

Delete or archive a memory.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "UUID of the memory to delete",
      "pattern": "^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$"
    },
    "permanent": {
      "type": "boolean",
      "description": "If false (default), archives instead of deleting",
      "default": false
    }
  },
  "required": ["id"]
}
```

#### Output Schema

```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "action": {
      "type": "string",
      "enum": ["archived", "deleted"],
      "description": "Action performed"
    },
    "id": {
      "type": "string",
      "description": "UUID of the affected memory"
    }
  }
}
```

---

### 5. get_memory_stats

Get statistics about stored memories.

#### Input Schema

```json
{
  "type": "object",
  "properties": {}
}
```

#### Output Schema

```json
{
  "type": "object",
  "properties": {
    "total_memories": {
      "type": "integer",
      "description": "Total number of non-archived memories"
    },
    "by_type": {
      "type": "object",
      "properties": {
        "core": { "type": "integer" },
        "learning": { "type": "integer" },
        "task": { "type": "integer" }
      }
    },
    "by_importance": {
      "type": "object",
      "properties": {
        "high": { "type": "integer" },
        "medium": { "type": "integer" },
        "low": { "type": "integer" }
      }
    },
    "archived_count": {
      "type": "integer"
    },
    "total_storage_kb": {
      "type": "number",
      "description": "Total storage used in kilobytes"
    },
    "oldest_memory": {
      "type": "string",
      "format": "date-time",
      "description": "Timestamp of oldest memory"
    },
    "newest_memory": {
      "type": "string",
      "format": "date-time",
      "description": "Timestamp of newest memory"
    },
    "most_accessed": {
      "type": "object",
      "description": "The memory with highest access count"
    },
    "top_tags": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "tag": { "type": "string" },
          "count": { "type": "integer" }
        }
      },
      "description": "Top 10 most used tags"
    }
  }
}
```

## Error Responses

All tools return errors in the standard MCP error format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Error Codes

- `INVALID_INPUT`: Input validation failed
- `NOT_FOUND`: Memory with specified ID not found
- `STORAGE_ERROR`: File system or storage error
- `PERMISSION_ERROR`: Insufficient permissions
- `CORRUPTED_DATA`: Memory file corruption detected
- `LIMIT_EXCEEDED`: Storage limit exceeded
- `INTERNAL_ERROR`: Unexpected internal error

## Tool Registration

Tools are registered with the MCP server using the following metadata:

```python
{
    "name": "store_memory",
    "description": "Store a new memory or update an existing one. Memories persist across sessions and help maintain context.",
    "inputSchema": { ... }
}
```

Each tool includes:
- Clear, concise description
- Complete JSON schema for inputs
- Examples in documentation
- Error handling specifications
