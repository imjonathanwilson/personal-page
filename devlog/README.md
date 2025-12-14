# Development Log (Devlog)

This directory contains timestamped development logs documenting issues, solutions, and important learnings from working on this project.

## Purpose

The devlog serves as a knowledge base for:
- **Troubleshooting history**: Problems encountered and how they were solved
- **Configuration gotchas**: Non-obvious settings and requirements
- **Lessons learned**: Important discoveries during development
- **Context for AI assistants**: Historical context to avoid repeating past mistakes

## Naming Convention

Files are named with the pattern: `YYYY-MM-DD-short-description.md`

Example: `2025-12-13-ansible-ssm-s3-bucket-fix.md`

## What to Document

Create a devlog entry when you encounter:
- Non-obvious bugs or errors
- Configuration issues that aren't well-documented
- "Gotchas" that took significant time to resolve
- Important architectural decisions
- Workarounds for tool limitations
- Failed approaches (so we don't repeat them)

## Entry Template

```markdown
# [Title - Brief Description of Issue/Task]

**Date:** YYYY-MM-DD
**Issue:** Brief problem statement
**Resolution:** Brief solution summary

## Problem

Detailed description of what went wrong or what needed to be done.

## Root Cause

Explanation of why the problem occurred.

## Solution

Step-by-step description of how it was fixed.

## Verification Steps

How to confirm the fix works.

## Additional Notes

- Any caveats
- Related issues
- Future considerations
- References to documentation

## References

- Links to relevant docs
- Related GitHub issues
- Stack Overflow posts, etc.
```

## Index

- **2025-12-13**: [Ansible SSM S3 Bucket Configuration](2025-12-13-ansible-ssm-s3-bucket-fix.md) - Fixed Ansible AWS SSM connection by adding required S3 bucket parameter

---

**Note**: Always check existing devlogs before starting work to avoid repeating solved problems.
