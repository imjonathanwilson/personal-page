# Configuration Specification - Agent Memory Server

## Overview

This document specifies how the Agent Memory Server is configured for use with Claude Code and other MCP clients.

## MCP Client Configuration

### Location

**Primary**: `~/.claude/mcp-config.json`

**Alternative** (project-specific): `./.claude/mcp-config.json`

### Configuration Schema

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
        "AUTO_ARCHIVE_TASKS_DAYS": "30",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

### Configuration Fields

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `command` | string | Python interpreter command |
| `args` | array | Arguments to launch the server |

#### Optional Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `MEMORY_DIR` | string | `~/.claude/agents/memories` | Base directory for memory storage |
| `MAX_CORE_MEMORIES` | integer | `1000` | Maximum core memories before archival required |
| `MAX_LEARNINGS` | integer | `500` | Maximum learnings before auto-archival |
| `MAX_TASKS` | integer | `200` | Maximum tasks before auto-archival |
| `AUTO_ARCHIVE_LEARNINGS_DAYS` | integer | `90` | Days before learnings auto-archive |
| `AUTO_ARCHIVE_TASKS_DAYS` | integer | `30` | Days after completion before tasks auto-archive |
| `ENABLE_AUTO_ARCHIVAL` | boolean | `true` | Enable automatic archival |
| `BACKUP_ENABLED` | boolean | `true` | Enable automatic backups |
| `MAX_BACKUPS` | integer | `5` | Maximum number of backups to retain |
| `LOG_LEVEL` | string | `INFO` | Logging level (DEBUG, INFO, WARNING, ERROR) |
| `LOG_FILE` | string | `~/.claude/agents/memories/server.log` | Log file location |
| `CACHE_SIZE` | integer | `100` | Number of memories to cache in RAM |
| `INDEX_REBUILD_ON_STARTUP` | boolean | `false` | Force index rebuild on startup |

## Server Configuration File (Optional)

For advanced users, a dedicated configuration file can be used:

### Location
`~/.claude/agents/memories/.memory-config.json`

### Schema

```json
{
  "version": "1.0.0",
  "storage": {
    "base_directory": "~/.claude/agents/memories",
    "file_permissions": "0600",
    "use_compression": false,
    "max_file_size_mb": 10
  },
  "limits": {
    "core_memories": {
      "max_count": 1000,
      "max_content_length": 5000,
      "max_tags": 10
    },
    "learnings": {
      "max_count": 500,
      "max_content_length": 5000,
      "auto_archive_days": 90
    },
    "tasks": {
      "max_count": 200,
      "max_content_length": 5000,
      "auto_archive_days": 30
    }
  },
  "performance": {
    "cache_size": 100,
    "cache_ttl_seconds": 300,
    "enable_lazy_loading": true,
    "index_in_memory": true
  },
  "backup": {
    "enabled": true,
    "max_backups": 5,
    "backup_on_update": true,
    "backup_on_delete": true
  },
  "archival": {
    "enabled": true,
    "archive_directory": "archive",
    "quarterly_archival": true,
    "compress_archives": false
  },
  "logging": {
    "level": "INFO",
    "file": "server.log",
    "max_size_mb": 10,
    "max_files": 3,
    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
  },
  "security": {
    "file_permissions_strict": true,
    "validate_on_load": true,
    "sanitize_inputs": true
  }
}
```

## Installation and Setup

### Step 1: Install the Server

```bash
# Option 1: Install from PyPI (when available)
pip install agent-memory-server

# Option 2: Install from source
git clone https://github.com/your-org/agent-memory-server
cd agent-memory-server
pip install -e .

# Option 3: Install specific version
pip install agent-memory-server==1.0.0
```

### Step 2: Create Memory Directory

The server will create the directory automatically on first run, but you can create it manually:

```bash
mkdir -p ~/.claude/agents/memories
chmod 700 ~/.claude/agents/memories
```

### Step 3: Configure MCP Client

Add the server configuration to `~/.claude/mcp-config.json`:

```bash
# Create config if it doesn't exist
mkdir -p ~/.claude
cat > ~/.claude/mcp-config.json <<'EOF'
{
  "mcpServers": {
    "agent-memory": {
      "command": "python",
      "args": ["-m", "agent_memory_server"],
      "env": {
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
EOF
```

Or merge with existing configuration:

```bash
# Edit existing config
vim ~/.claude/mcp-config.json
```

### Step 4: Verify Installation

```bash
# Test the server directly
python -m agent_memory_server --version

# Check if server starts
python -m agent_memory_server --test-connection

# Verify MCP client can connect (from Claude Code)
# The server should appear in available MCP servers
```

### Step 5: Initialize (Optional)

Create an initial configuration:

```bash
python -m agent_memory_server --init

# This creates:
# - ~/.claude/agents/memories/ directory
# - .memory-config.json with defaults
# - Empty memory files
# - index.json
```

## Configuration Precedence

Configuration is loaded in the following order (later overrides earlier):

1. **Default values** (hardcoded in application)
2. **Configuration file** (`~/.claude/agents/memories/.memory-config.json`)
3. **Environment variables** (from MCP config or shell)
4. **Command-line arguments** (if running server directly)

Example precedence:

```
Default MAX_CORE_MEMORIES = 1000
Override in .memory-config.json: "max_count": 2000
Override in env var: MAX_CORE_MEMORIES=1500
Final value: 1500
```

## Environment-Specific Configurations

### Development

```json
{
  "mcpServers": {
    "agent-memory": {
      "command": "python",
      "args": ["-m", "agent_memory_server"],
      "env": {
        "MEMORY_DIR": "./dev-memories",
        "LOG_LEVEL": "DEBUG",
        "INDEX_REBUILD_ON_STARTUP": "true",
        "ENABLE_AUTO_ARCHIVAL": "false"
      }
    }
  }
}
```

### Production

```json
{
  "mcpServers": {
    "agent-memory": {
      "command": "python",
      "args": ["-m", "agent_memory_server"],
      "env": {
        "MEMORY_DIR": "~/.claude/agents/memories",
        "LOG_LEVEL": "WARNING",
        "BACKUP_ENABLED": "true",
        "MAX_BACKUPS": "10"
      }
    }
  }
}
```

### Multiple Memory Spaces

For isolating different projects or agents:

```json
{
  "mcpServers": {
    "agent-memory-personal": {
      "command": "python",
      "args": ["-m", "agent_memory_server"],
      "env": {
        "MEMORY_DIR": "~/.claude/agents/memories/personal"
      }
    },
    "agent-memory-work": {
      "command": "python",
      "args": ["-m", "agent_memory_server"],
      "env": {
        "MEMORY_DIR": "~/.claude/agents/memories/work"
      }
    }
  }
}
```

## Command-Line Interface

For direct server management:

```bash
# Start server (normally done by MCP client)
python -m agent_memory_server

# Initialize directory structure
python -m agent_memory_server --init

# Rebuild index
python -m agent_memory_server --rebuild-index

# Validate memory files
python -m agent_memory_server --validate

# Show statistics
python -m agent_memory_server --stats

# Archive old memories
python -m agent_memory_server --archive --days 90

# Repair corrupted files
python -m agent_memory_server --repair

# Export memories to JSON
python -m agent_memory_server --export output.json

# Import memories from JSON
python -m agent_memory_server --import input.json

# Show version
python -m agent_memory_server --version

# Test connection
python -m agent_memory_server --test-connection
```

## Troubleshooting

### Server Won't Start

**Check Python version**:
```bash
python --version  # Should be 3.8+
```

**Check installation**:
```bash
pip show agent-memory-server
```

**Check permissions**:
```bash
ls -la ~/.claude/agents/memories
# Should show: drwx------ (700)
```

### Connection Issues

**Check MCP config syntax**:
```bash
python -m json.tool ~/.claude/mcp-config.json
```

**Check server logs**:
```bash
tail -f ~/.claude/agents/memories/server.log
```

**Enable debug logging**:
```json
{
  "env": {
    "LOG_LEVEL": "DEBUG"
  }
}
```

### Storage Issues

**Check disk space**:
```bash
df -h ~/.claude/agents/memories
```

**Validate memory files**:
```bash
python -m agent_memory_server --validate
```

**Rebuild corrupted index**:
```bash
python -m agent_memory_server --rebuild-index
```

## Migration from Other Systems

### From Custom JSON Files

```bash
# Convert custom JSON to agent memory format
python -m agent_memory_server --import custom-memories.json --type core
```

### From Note-Taking Apps

```bash
# Export notes to JSON, then import
# (Format conversion script may be needed)
python convert_notes.py notes.txt > notes.json
python -m agent_memory_server --import notes.json --type learning
```

## Security Hardening

### Restrict File Permissions

```bash
# Ensure only user can access
chmod 700 ~/.claude/agents/memories
chmod 600 ~/.claude/agents/memories/*.jsonl
chmod 600 ~/.claude/agents/memories/index.json
```

### Use Dedicated Memory Directory

```json
{
  "env": {
    "MEMORY_DIR": "/secure/path/agent-memories"
  }
}
```

### Enable Strict Validation

```json
{
  "security": {
    "validate_on_load": true,
    "sanitize_inputs": true,
    "file_permissions_strict": true
  }
}
```

### Audit Logging

```json
{
  "logging": {
    "level": "INFO",
    "audit_mode": true,
    "log_all_operations": true
  }
}
```

## Example Complete Configuration

### Minimal Configuration

```json
{
  "mcpServers": {
    "agent-memory": {
      "command": "python",
      "args": ["-m", "agent_memory_server"]
    }
  }
}
```

### Full Featured Configuration

```json
{
  "mcpServers": {
    "agent-memory": {
      "command": "python",
      "args": ["-m", "agent_memory_server"],
      "env": {
        "MEMORY_DIR": "~/.claude/agents/memories",
        "MAX_CORE_MEMORIES": "2000",
        "MAX_LEARNINGS": "1000",
        "MAX_TASKS": "500",
        "AUTO_ARCHIVE_LEARNINGS_DAYS": "60",
        "AUTO_ARCHIVE_TASKS_DAYS": "30",
        "ENABLE_AUTO_ARCHIVAL": "true",
        "BACKUP_ENABLED": "true",
        "MAX_BACKUPS": "10",
        "LOG_LEVEL": "INFO",
        "LOG_FILE": "~/.claude/agents/memories/server.log",
        "CACHE_SIZE": "200",
        "INDEX_REBUILD_ON_STARTUP": "false"
      }
    }
  }
}
```
