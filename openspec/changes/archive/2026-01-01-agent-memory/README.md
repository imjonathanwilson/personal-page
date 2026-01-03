# Agent Memory MCP Server - OpenSpec Change Proposal

## Quick Links

- **[Proposal](./proposal.md)** - Why we need this and what it will do
- **[Design](./design.md)** - Technical decisions and architecture
- **[Tasks](./tasks.md)** - Implementation checklist
- **[Specs](./specs/)** - Detailed specifications

## Overview

This change proposal outlines the development of an MCP (Model Context Protocol) server that provides persistent memory capabilities for AI agents across conversation sessions.

## Key Features

- **Persistent Memory**: Store core memories, learnings, and tasks across sessions
- **MCP Integration**: Seamless integration with Claude Code via MCP protocol
- **Local Storage**: File-based storage in `~/.claude/agents/memories/`
- **Smart Archival**: Automatic archival of old memories to prevent bloat
- **Fast Queries**: Tag-based indexing for quick memory retrieval

## Technology Choice

**Selected**: Fast MCP (Python)

Python was chosen for its simplicity, excellent async I/O support, and clean API design with the Fast MCP framework.

## Document Structure

### 1. [proposal.md](./proposal.md)
- Problem statement and motivation
- Proposed solution overview
- Success criteria and scope
- Risk analysis
- Alternative approaches considered

### 2. [design.md](./design.md)
- Framework selection rationale (Fast MCP)
- High-level architecture diagrams
- Data models and schemas
- Storage strategy (JSONL format)
- MCP tool and resource interfaces
- Performance and security considerations
- Future enhancement roadmap

### 3. [tasks.md](./tasks.md)
- Phase-by-phase implementation checklist
- 8 phases from setup to release
- Testing and documentation tasks
- Success metrics
- Future enhancements backlog

### 4. [specs/](./specs/)

Detailed technical specifications:

#### [mcp-tools.md](./specs/mcp-tools.md)
- 5 MCP tools with complete schemas
  - `store_memory` - Store/update memories
  - `query_memories` - Search and filter
  - `update_memory` - Modify existing
  - `delete_memory` - Archive/delete
  - `get_memory_stats` - Statistics
- Input/output schemas
- Error handling
- Usage examples

#### [mcp-resources.md](./specs/mcp-resources.md)
- 5 MCP resources for read-only access
  - `memory://recent` - Last 20 accessed
  - `memory://core` - All core memories
  - `memory://learnings` - Recent learnings
  - `memory://tasks/active` - Active tasks
  - `memory://tasks/completed` - Completed tasks
- Resource schemas and metadata
- Caching and performance
- Usage patterns

#### [storage-format.md](./specs/storage-format.md)
- JSONL file format specification
- Directory structure
- Memory object schemas
- Index file format
- File operations (read/write/update)
- Concurrency control with file locking
- Backup and archival strategies
- Validation and repair procedures
- Performance characteristics

#### [configuration.md](./specs/configuration.md)
- MCP client configuration (`~/.claude/mcp-config.json`)
- Environment variables
- Optional configuration file
- Installation and setup guide
- Environment-specific configs
- Command-line interface
- Troubleshooting guide
- Security hardening

## Getting Started

### For Reviewers

1. Read [proposal.md](./proposal.md) for context and motivation
2. Review [design.md](./design.md) for technical approach
3. Check [tasks.md](./tasks.md) for implementation scope
4. Dive into [specs/](./specs/) for detailed specifications

### For Implementers

1. Review all documents for complete understanding
2. Follow [tasks.md](./tasks.md) phase-by-phase
3. Reference [specs/](./specs/) during implementation
4. Use [configuration.md](./specs/configuration.md) for setup

## Key Design Decisions

### 1. Fast MCP (Python) over Node.js
- Cleaner API with decorators
- Better ML/AI ecosystem access
- Simpler deployment

### 2. JSONL File Format
- Human-readable and editable
- Appendable without parsing entire file
- Recoverable from partial corruption
- Simple, no database dependencies

### 3. Local-First Storage
- Privacy by default (no cloud)
- No network dependencies
- Fast access
- User owns their data

### 4. Three Memory Types
- **Core**: Long-term facts and preferences
- **Learnings**: Recent insights and discoveries
- **Tasks**: Work history and outcomes

### 5. Automatic Archival
- Learnings: 90 days of inactivity
- Tasks: 30 days post-completion
- Core: Manual only
- Prevents unbounded growth

## Implementation Phases

1. **Project Setup** - Structure, dependencies, config
2. **Storage Layer** - File I/O, locking, backups
3. **Memory Manager** - Query, cache, auto-archival
4. **MCP Server** - Tools, resources, protocol
5. **Testing** - Unit, integration, performance
6. **Documentation** - User guides, API docs, examples
7. **Distribution** - Packaging, installation
8. **Polish** - Code quality, security review, release

## Success Criteria

- [ ] Memories persist across sessions
- [ ] Performance <100ms for typical queries
- [ ] >80% test coverage
- [ ] Human-readable storage format
- [ ] Seamless Claude Code integration
- [ ] Complete documentation
- [ ] Zero critical security vulnerabilities

## Timeline

This is a self-contained project that can be developed incrementally. Core functionality can be built and tested phase-by-phase, with advanced features added later.

## Questions or Feedback?

This is a living document. If you have questions or suggestions:

1. Review the relevant specification document
2. Check if your question is addressed in design.md
3. Suggest improvements or alternatives
4. Propose additional use cases

## Next Steps

1. **Review** - Stakeholders review and approve this proposal
2. **Refine** - Address feedback and update documents
3. **Implement** - Begin Phase 1 (Project Setup)
4. **Iterate** - Work through phases, updating specs as needed
5. **Release** - Ship v1.0 when all success criteria met

---

**Status**: Proposal Created
**Version**: 1.0.0
**Created**: 2026-01-01
**Last Updated**: 2026-01-01
