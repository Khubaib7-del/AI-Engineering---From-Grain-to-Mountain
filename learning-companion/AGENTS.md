# AI Learning companion — application context

Read `../AGENTS.md` for product intent and `VALIDATION.md` for observed checks. This is a personal Expo/React Native application with web, Android and iOS targets. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Current direction and preservation

The user rejected orange/green styling. Use black/charcoal, white/silver actions, neutral light mode, Apple-inspired depth and purposeful motion. Public references: Hoplite for composition; UIArc for interaction. Do not revive the warm palette from historical notes. `design/MONOCHROME-DIRECTION.md` is the current record. `assets/brand/` contains the original folded-page logo; `scripts/make-brand-assets.mjs` regenerates PNGs.

Preserve stable curriculum IDs, Watch/Build/Recall, evidence gates, progress, notes, prerequisites, reminders and backups. Inspect `scripts/sync-content.mjs` before relocating parent documents/data. Browser checks use isolated profiles, never personal progress.

## File map and handoff

- `src/app/`: routes/navigation; `src/components/`: UI/motion; `src/lib/`: data, persistence and planning.
- `scripts/`: content sync, preview, screenshots and interaction checks; `tests/`: regressions.
- `design/`: current/historical decisions and captures; `releases/`: actual packages and install notes when produced.
- `DEPENDENCY-SECURITY.md`: known limitations; do not assume a clean security audit.

Preview: `node scripts/serve-preview.mjs` serves the web export at localhost:8090. A phone cannot use the desktop's loopback URL. An installable standalone Android APK must bundle JS and have a verified signature. Personal test signing is not store signing. Never describe a source ZIP/web export as an APK or claim iPhone installation from an APK. Update `VALIDATION.md` with artifact paths, signing/architecture limits and failures at handoff. Native generation and configuration rules below remain applicable.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
