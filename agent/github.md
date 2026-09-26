---
description: Read-only GitHub inspector via GitHub MCP tools. Use when the primary needs to search or read repositories, code, issues, pull requests, branches, releases, actions, or CI/check status on GitHub. Handles search, list, get, read, status, check, and log inspection only — it never creates, updates, or deletes anything.
mode: all
variant: high
permissions:
  - action: "*"
    resource: "*"
    effect: deny
  - action: read
    resource: "*"
    effect: allow
  - action: read
    resource: "*.env"
    effect: deny
  - action: read
    resource: "*.env.*"
    effect: deny
  - action: read
    resource: "*.env.example"
    effect: allow
  - action: glob
    resource: "*"
    effect: allow
  - action: grep
    resource: "*"
    effect: allow
  - action: list
    resource: "*"
    effect: allow
  - action: webfetch
    resource: "*"
    effect: allow
  - action: websearch
    resource: "*"
    effect: allow
  - action: lsp
    resource: "*"
    effect: allow
  - action: question
    resource: "*"
    effect: allow
  - action: external_directory
    resource: "*"
    effect: ask
  - action: github*
    resource: "*"
    effect: allow
---
