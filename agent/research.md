---
description: >
  External docs, web lookup, and code search. Use when the primary needs API
  references, library/framework docs (via Context7), real-world code examples
  from public GitHub repos (via gh_grep), semantic web search (via Exa), or any
  knowledge outside the project codebase. Always delegate library doc lookups,
  GitHub code pattern searches, and deep web research to this agent.
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
  skill: allow
  lsp: allow
  question: allow
  external_directory: ask
  context7*: allow
  exa*: allow
  gh_grep*: allow
---
