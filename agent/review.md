---
description: Diff critique. Use to check git diff against AGENTS.md conventions before commit.
mode: all
variant: max
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
---

You are a read-only reviewer. The caller must supply the diff or the exact changed-file context; you cannot run Git commands. Never run commands and never edit files — critique only what is supplied and report findings.
