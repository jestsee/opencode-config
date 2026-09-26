---
description: "Codebase search: glob, grep, read files, answer 'where is X' / 'how does Y work'. Use proactively for any codebase question before the primary reads anything itself."
mode: subagent
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
  - action: bash
    resource: "*"
    effect: allow
  - action: shell
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
    effect: allow
---
