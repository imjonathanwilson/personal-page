# MCP Resources Specification - Agent Memory Server

## Overview

This document specifies the MCP resources exposed by the Agent Memory Server. Resources provide read-only access to memory collections through URI-based references.

## Resource Definitions

### 1. memory://recent

Recent memories across all types (last 20 accessed).

#### URI
```
memory://recent
```

#### Parameters
None (URI-based resource, no query parameters)

#### Returns

```json
{
  "uri": "memory://recent",
  "mimeType": "application/json",
  "content": {
    "memories": [
      {
        "id": "uuid",
        "type": "core|learning|task",
        "content": "...",
        "category": "...",
        "created_at": "2026-01-01T10:00:00Z",
        "updated_at": "2026-01-01T10:00:00Z",
        "accessed_at": "2026-01-01T10:00:00Z",
        "access_count": 5,
        "tags": ["tag1", "tag2"],
        "importance": "high|medium|low",
        "archived": false
      }
    ],
    "count": 20,
    "generated_at": "2026-01-01T10:00:00Z"
  }
}
```

#### Description

Returns the 20 most recently accessed memories across all types. Useful for agents to quickly catch up on recent context when starting a new session.

Sorted by `accessed_at` descending.

---

### 2. memory://core

All non-archived core memories.

#### URI
```
memory://core
```

#### Returns

```json
{
  "uri": "memory://core",
  "mimeType": "application/json",
  "content": {
    "memories": [
      {
        "id": "uuid",
        "type": "core",
        "content": "...",
        "category": "preference|fact|pattern|...",
        "created_at": "2026-01-01T10:00:00Z",
        "updated_at": "2026-01-01T10:00:00Z",
        "accessed_at": "2026-01-01T10:00:00Z",
        "access_count": 5,
        "tags": ["tag1", "tag2"],
        "importance": "high|medium|low",
        "archived": false
      }
    ],
    "count": 150,
    "by_importance": {
      "high": 30,
      "medium": 80,
      "low": 40
    },
    "by_category": {
      "preference": 45,
      "fact": 60,
      "pattern": 30,
      "other": 15
    },
    "generated_at": "2026-01-01T10:00:00Z"
  }
}
```

#### Description

Returns all core memories that are not archived. Core memories represent fundamental, long-term facts about the user, their preferences, and persistent patterns.

Sorted by `importance` (high first), then `accessed_at` descending.

---

### 3. memory://learnings

Recent learnings from the last 30 days.

#### URI
```
memory://learnings
```

#### Returns

```json
{
  "uri": "memory://learnings",
  "mimeType": "application/json",
  "content": {
    "memories": [
      {
        "id": "uuid",
        "type": "learning",
        "content": "...",
        "category": "insight|solution|discovery|...",
        "created_at": "2026-01-01T10:00:00Z",
        "updated_at": "2026-01-01T10:00:00Z",
        "accessed_at": "2026-01-01T10:00:00Z",
        "access_count": 3,
        "tags": ["tag1", "tag2"],
        "importance": "high|medium|low",
        "archived": false
      }
    ],
    "count": 45,
    "date_range": {
      "from": "2025-12-02T00:00:00Z",
      "to": "2026-01-01T10:00:00Z"
    },
    "generated_at": "2026-01-01T10:00:00Z"
  }
}
```

#### Description

Returns learnings created or accessed within the last 30 days. Learnings represent insights, solutions, and discoveries from recent work sessions.

Sorted by `created_at` descending.

---

### 4. memory://tasks/active

Active (non-archived) tasks.

#### URI
```
memory://tasks/active
```

#### Returns

```json
{
  "uri": "memory://tasks/active",
  "mimeType": "application/json",
  "content": {
    "memories": [
      {
        "id": "uuid",
        "type": "task",
        "content": "...",
        "category": "completed|in-progress|blocked|...",
        "created_at": "2026-01-01T10:00:00Z",
        "updated_at": "2026-01-01T10:00:00Z",
        "accessed_at": "2026-01-01T10:00:00Z",
        "access_count": 8,
        "tags": ["tag1", "tag2"],
        "importance": "high|medium|low",
        "archived": false,
        "task_metadata": {
          "status": "completed|in-progress|blocked",
          "completed_at": "2026-01-01T09:00:00Z",
          "blockers": ["reason1", "reason2"]
        }
      }
    ],
    "count": 12,
    "by_status": {
      "completed": 8,
      "in-progress": 3,
      "blocked": 1
    },
    "generated_at": "2026-01-01T10:00:00Z"
  }
}
```

#### Description

Returns all non-archived tasks. Tasks represent work items with their outcomes, current status, and any blockers.

Sorted by `updated_at` descending.

---

### 5. memory://tasks/completed

Recently completed tasks (last 30 days).

#### URI
```
memory://tasks/completed
```

#### Returns

```json
{
  "uri": "memory://tasks/completed",
  "mimeType": "application/json",
  "content": {
    "memories": [
      {
        "id": "uuid",
        "type": "task",
        "content": "...",
        "category": "completed",
        "created_at": "2025-12-15T10:00:00Z",
        "updated_at": "2025-12-20T15:30:00Z",
        "accessed_at": "2026-01-01T10:00:00Z",
        "access_count": 5,
        "tags": ["tag1", "tag2"],
        "importance": "high|medium|low",
        "archived": false,
        "task_metadata": {
          "status": "completed",
          "completed_at": "2025-12-20T15:30:00Z",
          "outcome": "Success - Feature implemented and tested"
        }
      }
    ],
    "count": 15,
    "date_range": {
      "from": "2025-12-02T00:00:00Z",
      "to": "2026-01-01T10:00:00Z"
    },
    "generated_at": "2026-01-01T10:00:00Z"
  }
}
```

#### Description

Returns tasks completed within the last 30 days. Useful for reviewing recent work and understanding what has been accomplished.

Sorted by `completed_at` descending (via task_metadata).

---

## Resource Registration

Resources are registered with the MCP server with the following metadata:

```python
{
    "uri": "memory://recent",
    "name": "Recent Memories",
    "description": "The 20 most recently accessed memories across all types",
    "mimeType": "application/json"
}
```

## Resource Update Behavior

### Caching
- Resources are dynamically generated on each request
- No client-side caching recommended (data changes frequently)
- Server may implement short-lived caching (5 seconds) for performance

### Access Tracking
- Reading a resource does NOT update `accessed_at` for individual memories
- Only explicit tool calls (query_memories, update_memory) update access metadata

### Performance Considerations
- Resources are optimized for quick retrieval
- Large resource sets (memory://core) may be paginated in future versions
- Limit of 1000 memories per resource response

## Error Handling

Resource requests may fail with the following errors:

### Resource Not Found
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource URI not recognized: memory://invalid"
  }
}
```

### Storage Error
```json
{
  "error": {
    "code": "STORAGE_ERROR",
    "message": "Unable to read memory storage: permission denied"
  }
}
```

### Corrupted Data
```json
{
  "error": {
    "code": "CORRUPTED_DATA",
    "message": "Memory storage corrupted. Run repair tool or restore from backup."
  }
}
```

## Usage Examples

### Example 1: Agent Startup Context

When an agent starts a new session, it can quickly load recent context:

```python
# Agent reads memory://recent resource
recent_memories = read_resource("memory://recent")

# Agent now has context from last 20 interactions
# Can reference user preferences, recent learnings, ongoing tasks
```

### Example 2: Task Review

Agent reviewing completed work:

```python
# Agent reads completed tasks
completed = read_resource("memory://tasks/completed")

# Agent can summarize recent accomplishments
# Or continue from where previous sessions left off
```

### Example 3: Core Preferences Lookup

Agent checking user preferences before making decisions:

```python
# Agent reads all core memories
core = read_resource("memory://core")

# Filter for preferences
preferences = [m for m in core['memories'] if m['category'] == 'preference']

# Apply preferences to current task
```

## Future Enhancements

### Parameterized Resources (v2.0)
Support query parameters in URIs:

```
memory://recent?limit=50
memory://learnings?since=2025-12-01
memory://tasks/active?tags=python,testing
```

### Subscribe/Notify (v2.0)
Real-time updates when resources change:

```python
subscribe("memory://tasks/active")
# Receive notifications when tasks are added/updated
```

### Custom Views (v2.0)
User-defined resource views:

```
memory://custom/python-work
memory://custom/high-priority
```
