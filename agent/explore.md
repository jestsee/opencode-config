---
description: "Codebase search: glob, grep, read files, answer 'where is X' / 'how does Y work'. Use proactively for any codebase question before the primary reads anything itself."
mode: subagent
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
  external_directory: allow
---
