---
description: Read-only GitHub inspector via GitHub MCP tools. Use when the primary needs to search or read repositories, code, issues, pull requests, branches, releases, actions, or CI/check status on GitHub. Handles search, list, get, read, status, check, and log inspection only — it never creates, updates, or deletes anything.
mode: all
variant: high
permission:
  "*": deny
  read:
    "*": allow
    "*.env": deny
    "*.env.*": deny
    "*.env.example": allow
  glob: allow
  grep: allow
  list: allow
  webfetch: allow
  websearch: allow
  lsp: allow
  question: allow
  external_directory: ask
  github*: allow
---
