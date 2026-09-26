---
description: >
  External docs, web lookup, and code search. Use when the primary needs API
  references, library/framework docs (via Context7), real-world code examples
  from public GitHub repos (via gh_grep), semantic web search (via Exa), or any
  knowledge outside the project codebase. Always delegate library doc lookups,
  GitHub code pattern searches, and deep web research to this agent.
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
  - action: skill
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
  - action: context7*
    resource: "*"
    effect: allow
  - action: exa*
    resource: "*"
    effect: allow
  - action: gh_grep*
    resource: "*"
    effect: allow
---
