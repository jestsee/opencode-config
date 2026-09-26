# OpenCode Config (native V2)

## Files

- `opencode.json` — public base config. Safe to commit.
- `opencode.jsonc` — private overlay, ignored by Git. OpenCode loads and merges it automatically; on conflict the overlay wins.
- `ntfy.json` — private ntfy notification settings, ignored by Git.
- `models/small-model.txt` — shared source for the small model value used by `{file:...}` references.
- `package.json` / `pnpm-lock.yaml` — plugin dependencies (`@opencode/plugin`). Install with `pnpm install`.
- `plugins/ntfy-notify.ts` — local plugin, auto-discovered from `plugins/`. No config entry needed.

## Setup

```sh
cp opencode.example.jsonc opencode.jsonc
chmod 600 opencode.jsonc
# fill in real values

cp ntfy.example.json ntfy.json
chmod 600 ntfy.json
# fill in url (and token if the topic is protected)
```

The ntfy plugin reads `ntfy.json` at startup. Without a valid file it silently disables itself.

Never commit private files (`opencode.jsonc`, `ntfy.json`, `.env`).
