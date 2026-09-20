---
name: set-app-identity
description: "Sweep every file that carries app identity (name, bundle id, scheme, URLs, emails, entitlement IDs, DB filename, EAS project, theme colors) and update them in one consistent pass when renaming/rebranding an expo-starter project. Use when the user says 'rename the app', 'rebrand', 'change app identity', 'update bundle id', 'set up identity for a new project', 'customize the template', or otherwise needs to replace the placeholder identity shipped with expo-starter. Covers app.config.ts BASE_* constants, package.json name, constants/index WEB_URL, lib/mail SUPPORT_EMAIL, constants/revenuecat ENTITLEMENT_ID, db/app/index DB filename, maestro appId, paywall plan names, tailwind theme colors, and EAS project config."
version: 1.0.0
license: MIT
---

# Set App Identity

When a new project is created from the `expo-starter` template, it ships with placeholder identity. This skill performs the full sweep to replace every placeholder in one consistent pass.

## When to use

- Spinning up a new project from the expo-starter template
- Rebranding or renaming an existing project
- User asks to "rename the app", "change the bundle id", "set up identity", "rebrand", "customize the template"

## Gather inputs first

Before editing anything, ask the user (or collect from context) for ALL of these. Present them as a checklist so nothing is missed:

1. **App display name** (e.g. "My App") — used in app.config.ts BASE_NAME and iOS CFBundleDisplayName
2. **Bundle identifier** (reverse-DNS, e.g. `com.company.myapp`) — used as BASE_IDENTIFIER; the dev/preview variants get `.dev`/`.preview` suffixes automatically
3. **URL scheme** (lowercase, no dots, e.g. `myapp`) — used as BASE_SCHEME
4. **Project slug** (kebab-case, e.g. `my-app`) — used as BASE_SLUG and package.json `name`
5. **Web URL** (e.g. `https://myapp.com`) — used for terms/privacy/website links
6. **Support email** (e.g. `support@myapp.com`) — used in feedback mail composer
7. **RevenueCat entitlement ID** (e.g. `pro` or `premium`) — keep `"pro"` if unsure
8. **EAS project ID** (UUID from expo.dev) — optional; can be set later via `eas init`
9. **Apple Team ID** — optional; only needed for iOS builds. Set in app.config.ts `ios.appleTeamId`
10. **DB filename** (e.g. `myapp.db`) — keep `app.db` if unsure

If the user doesn't supply optional ones (#8, #9, #10), leave placeholders or use sensible defaults and note them as TODOs.

## File-by-file edit checklist

Edit these files IN ORDER. After each edit, verify the change. Do NOT skip any.

### 1. `app.config.ts` — the central identity hub

This is the single source of truth for app name, bundle, scheme, slug, app group. Edit the four `BASE_*` constants near the top:

```ts
const BASE_NAME = "App";           // → new display name
const BASE_SLUG = "expo-starter";  // → new kebab-case slug
const BASE_SCHEME = "app";         // → new lowercase scheme
const BASE_IDENTIFIER = "com.example.app"; // → new bundle id
```

The dev/preview variants (`${BASE_NAME} Dev`, `${BASE_IDENTIFIER}.dev`, etc.) derive automatically — do NOT edit those.

Also in app.config.ts:
- `ios.appleTeamId` — currently unset; add the team id if the user provided one (e.g. `appleTeamId: "XXXXXXXXXX"`)
- `extra.eas.projectId` — currently unset; add the EAS project UUID if provided
- `updates.url` — currently unset; if EAS project ID is set, also set `updates: { url: "https://u.expo.dev/<PROJECT_ID>" }`
- `ios.icon` — if the user has a custom icon set dir, point to it (otherwise the default `./assets/images/icon.png` is used via the root `icon` field)

### 2. `package.json`

Change `"name": "expo-starter"` → `"name": "<new-slug>"`.

### 3. `constants/index.ts`

```ts
export const WEB_URL =
  process.env.EXPO_PUBLIC_WEB_URL || "https://example.com";
```
Replace `https://example.com` → the user's web URL.

### 4. `lib/mail.ts`

```ts
const SUPPORT_EMAIL = "support@example.com";
```
Replace → the user's support email. This is referenced by the feedback feature in settings.

### 5. `constants/revenuecat.ts`

```ts
export const ENTITLEMENT_ID = "pro";
```
Replace `"pro"` → the user's RevenueCat entitlement ID if different. This must match the entitlement configured in the RevenueCat dashboard.

### 6. `db/app/index.ts`

```ts
export const expoDb = SQLite.openDatabaseSync("app.db", {
```
Replace `"app.db"` → the user's DB filename (e.g. `"myapp.db"`). After changing, regenerate the migration is NOT needed (filename is runtime-only), but the on-device DB will be fresh — any existing user data on dev devices will be orphaned (fine for a new project).

### 7. `maestro/app-launch.yaml`

```yaml
appId: com.example.app.dev
```
Replace → `<new-bundle-id>.dev` (the development variant bundle id). This must match the `development` variant's bundle id from app.config.ts.

### 8. `constants/paywall.ts` (optional branding)

If the user wants custom plan branding (not "Pro"), update the four plan names in `MAPPING_PRICING_PLANS`:
- `"Pro yearly"` → e.g. `"Premium yearly"`
- `"Pro monthly"`, `"Pro weekly"`, `"Pro lifetime"` similarly

Also update `constants/settings.tsx` `MAP_PURCHASED_ENTITLEMENTS` values to match.

### 9. `tailwind.config.js` + `constants/themes.ts` (optional rebrand)

If the user wants custom brand colors (not the default blue):
- Update the four colors in `tailwind.config.js` `theme.extend.colors` (`primary`, `secondary`, `background`, `emphasis`)
- Update the `"light"` and `"dark"` theme entries in `constants/themes.ts` to match

### 10. `eas.json` (optional)

If the user has an App Store Connect app ID, add it back under `submit.production`:
```json
"submit": {
  "production": {
    "ios": {
      "ascAppId": "<APP_STORE_CONNECT_NUMERIC_ID>"
    }
  }
}
```

### 11. `.env` — runtime credentials (REQUIRED for full functionality)

Copy `.env.example` to `.env` and fill in the integration keys. The app gracefully degrades when these are missing (PostHog disables, RevenueCat skips IAP), but for production you need:

```bash
cp .env.example .env
```

Variables to set:
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` — RevenueCat public iOS SDK key
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` — RevenueCat public Android SDK key
- `EXPO_PUBLIC_POST_HOG_API_KEY` — PostHog project API key
- `EXPO_PUBLIC_POST_HOG_HOST` — (optional) only for PostHog self-hosted/EU cloud
- `EXPO_PUBLIC_WEB_URL` — (optional) overrides `WEB_URL` fallback in `constants/index.ts`

The `.env` file is gitignored. `.env.example` is tracked as a template.

## Verification

After all edits, run these and fix any breakage:

```bash
pnpm tsc --noEmit   # type check
pnpm lint            # lint + prettier
```

Then verify the app.config resolves correctly:
```bash
npx expo config --type prebuild 2>&1 | head -20
```

## What NOT to touch

- Do NOT edit the dev/preview variant suffixes in app.config.ts — they derive from BASE_*
- Do NOT edit `eas.json` build profile names (`development`/`preview`/`production`) — those are stable
- Do NOT regenerate `drizzle/` migrations unless the schema changed
- Do NOT edit `i18n/locales/en-US.ts` unless the user wants different display copy

## Common mistakes to avoid

- Forgetting `maestro/app-launch.yaml` appId — E2E will fail to launch
- Setting `BASE_SCHEME` with uppercase or dots — must be lowercase, no dots
- Setting `BASE_IDENTIFIER` without reverse-DNS — iOS rejects non-reverse-DNS bundle ids
- Mismatching ENTITLEMENT_ID with the RevenueCat dashboard — purchases won't unlock features
- Leaving `example.com` as WEB_URL — terms/privacy links will 404 in production