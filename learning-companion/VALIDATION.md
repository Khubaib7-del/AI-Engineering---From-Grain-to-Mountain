# Prototype validation · 2026-10-07

This is a working local prototype, not a signed or store-distributed release.

## Passed

- TypeScript `tsc --noEmit` and Expo ESLint.
- Seven tests: six planner checks covering prerequisites, task/evidence completion gate, midnight quiet hours, reminder timing/deduplication, backup validation and recall intervals; one patched UUID/Xcode integration regression.
- Expo Doctor: 21 of 21 checks. Expo SDK 57 compatible versions include Reanimated 4.5.1 and Worklets 0.10.1.
- Android, iOS and web JavaScript exports. These validate bundling; no APK/IPA, native compiler or signing validation is implied. `--no-bytecode` was used for this local check; normal release builds should use Hermes bytecode.
- Chrome interactions with an isolated profile: lesson completion, saved evidence after reload, next lesson, prerequisite locks, topic persistence, CampusX search, dark theme, invalid settings and import preserving existing work, JSON export and small viewport without horizontal overflow.
- Independent static design review: Round 2 met the supplied skill's stop rule (9/12 scores at 4; all at least 3). See `design/CRITIQUE.md` for exact scores and subsequent refinements.

## Still requires device/release testing

Actual iPhone and Android testing: notification delivery/taps, permission denial, SQLite persistence, safe areas and keyboards, accessibility/font scaling, reduced motion and haptics. The web reminder control is explicitly disabled. Local reminders cover up to seven days and require reopening to refresh.

The curriculum path contains 21 modules and 740 concepts; 28 daily sessions are authored. Completion and assessments are self-reported, with evidence required for sessions. External lessons are linked rather than hosted or played inside the app.

## Dependencies

The post-fix audit reports 21 affected packages (3 moderate, 18 high), down from 28. A scoped Xcode UUID override installs patched 11.1.1 with an integration regression test. Three root advisories remain; see [dependency review](DEPENDENCY-SECURITY.md) for available releases, module-format constraints and release blockers. npm's proposed Expo downgrade/SDK mix was not applied.

## Reproduce

Saved-material content pass: core remains 21 modules/740 concepts; Library now includes 28 papers and 17 supplementary video/learning resources. Eight optional depth units/58 checkpoints remain in the parent documents and structured JSON, not tracked daily app sessions. Updated web export, typecheck, lint and all seven tests passed. Browser checks confirmed Karpathy/Reflexion search, successful backup restoration with reminders off, malformed-import preservation and the existing lesson/progress flows.

Run the commands in README.md. Browser screenshots are in `design/shots/app`; they contain isolated test progress, not the user's learning record. The preview is served on port 8090 from the exported `dist` folder. Native local storage and native notification execution have not been exercised by browser tests.

## Apple-inspired redesign verification — 2026-10-07

All seven routes redesigned. Typecheck, lint, seven unit tests and web export passed. Existing browser flow checks passed after the final changes. Captured 28 route/theme/viewport combinations at 390×844 and 1440×1080 with no horizontal overflow or browser runtime errors. Reviewed representative desktop/mobile screenshots, corrected detail-page overflow, mobile panel stretching and tab-selection corners. Captures use isolated test profiles, not personal progress. See design/APPLE-REDESIGN.md for sources and design decisions; design/shots/redesign for captures. The resource catalog currently contains 27 supplementary entries.

This is a cross-platform Liquid Glass-inspired blur treatment. Native iOS/Android rendering, device accessibility behavior and release-build frame rates remain unverified on hardware.

Final visual correction: replaced zero flex basis with auto sizing for stacked mobile panels. Added a geometric browser assertion that the journey panel follows the lesson action, preventing overlapping panels. Final 28 captures and this new assertion passed; typecheck and lint also passed after the correction. Mobile Today and dark Progress screenshots were visually inspected after the fix.

## Personal workshop redesign — 2026-10-07

Replaced the restrained blue direction with warm paper/rust and forest/peach themes, Lucide icons, a learning orbit, chapter atlas, resource shelf and a floating navigation dock. UIArc references and implementation decisions are recorded in `design/WORKSHOP-DIRECTION.md`.

- Typecheck, lint, all seven unit tests and the web production export passed after the application changes.
- All 28 route/theme/viewport captures passed overflow and runtime-error checks; representative desktop and mobile captures were visually reviewed.
- Existing browser flows passed, including completion/evidence, persistence, prerequisites, resource search, settings and backup restoration.
- `node scripts/motion-check.mjs` passed actual press-scale measurement, sliding filter selection, resource disclosure, chapter navigation, practice-mode content changes and browser reduced-motion behavior.
- The preview server handles missing assets during rebuilds without crashing.

Native iPhone/Android rendering and performance remain untested. The web JavaScript export is approximately 4.3 MB before transport compression; public Lucide imports were retained after individual subpath imports failed in this Expo setup. Bundle optimization remains a release-performance follow-up. No native frame-rate or device accessibility claims are implied by these browser checks.

## Monochrome revision — 2026-10-07

Replaced warm and green surfaces with neutral black/charcoal and grayscale light mode. Added original SVG/PNG folded-page branding and launcher assets. New profiles default to dark; saved explicit theme choices are preserved. Current design evidence is in `design/MONOCHROME-DIRECTION.md`.

Typecheck, lint, seven tests, web export, 28 screen captures, existing browser flows and motion/reduced-motion checks passed. Reviewed dark mobile Today, dark desktop Today/Path and light mobile Library. TypeScript exceeded Node's default stack on this dependency graph; the typecheck script now allocates an 8192 KB stack and passed without suppressing diagnostics. Web JS remains approximately 4.3 MB before transport compression.

Separate workspace AGENTS.md files preserve source provenance and project context. Stable numbered documents and data paths were retained to preserve existing citations and content generation. Additional native packaging results are recorded below when established.

## Guided learning — 2026-10-08

Added structured resource routes for all 21 modules and study assignments/reading links/stopping conditions for all 28 authored daily lessons. Added three supplementary resources (30 total). Stable lesson/topic IDs and existing progress remain unchanged. Modules show optional explanations only on request.

Typecheck, lint, seven tests and web export passed. Data checks verified complete, unique module coverage and all daily study fields. `study-guide-check.mjs` passed daily course/notes URL targets, hidden/shown optional resources including both CampusX tracks, mobile overflow and runtime-error checks. Existing browser progress/backup flows also passed. The web bundle is approximately 4.4 MB before transport compression. This is not per-concept video timestamp coverage or multi-year daily scheduling.

The previous Android build failed on generated C++ paths exceeding old Ninja's 260-character limit, even after path hashing/shorter staging. The current retry uses project-local, official checksum-verified Ninja 1.13.1 via the Expo config plugin. Do not claim an installable APK until its build, signature and startup are verified.

## Android package — 2026-10-08

The ARM64 build completed successfully (576 tasks; log: `releases/android-build.log`). Packaged `releases/AI-Learning-1.0.0-android-arm64.apk`, 47,748,479 bytes; SHA256 `83d69defc1ae9f6d0a07444c61976015504292eddc3e4f3528705d391ae25ea1`. `apksigner verify --verbose` passed APK v2 signing. Manifest reports package `com.khubaib.ailearning`, version 1.0.0/code 1, min SDK 24, target SDK 36, ARM64 only. Archive contains `assets/index.android.bundle` and `lib/arm64-v8a/libreactnative.so`. This uses personal development/test signing, not a production store key.

Installation on the isolated Android 14 x86_64 emulator succeeded, but ARM translation startup failed: SoLoader searched the APK's x86_64 path while the package contained ARM64 libraries. This is a failed ARM-translation test, not evidence of working phone startup. The packaging script now rejects APKs with a missing ARM64 library/JS bundle or a different architecture.

A separate x86_64 release build then completed successfully (532 tasks, `releases/android-emulator-build.log`). It installed and opened Today, then cold-launched with emulator Wi-Fi and mobile data disabled. Navigating to the first lesson displayed its bundled Harvard assignment, 20-minute first step and stopping condition. Visually reviewed `design/shots/android-offline-lesson.png`; AndroidRuntime/ReactNativeJS error logs were empty after this build's launch. The emulator briefly displayed a **System UI** not responding dialog after compilation; dismissed it, then the offline restart/navigation succeeded. This is a functional smoke test, not a native performance certification.

The x86_64 output in `android/app/build/outputs/apk/release/` is for the emulator only. The named ARM64 file in `releases/` retains the hash above and is the phone download. Physical ARM64-device startup, notification delivery and native iOS remain unverified.

## Product website and account scaffold — 2026-10-08

Added public homepage/download/privacy routes, moved Today to `/today`, and prepared Supabase auth plus account-scoped offline storage and revision-checked sync. Existing guest storage keys are preserved. The published 1.0 APK has not acquired these changes.

Typecheck, lint, ten tests and web export passed (4.7 MB JS before compression). Browser checks passed desktop/mobile product/account/download/Today routes, unavailable-backend messaging, guest navigation, overflow, runtime errors, existing lesson/progress/backup flows and guided resource links. Visually inspected the desktop homepage and mobile account screen. Captures: `design/shots/product/`.

These tests ran without a Supabase backend. Hosted schema/RLS, real email/signup/recovery, real cross-device sync, native secure session storage and native account navigation are unverified. Supabase OAuth is authorized but this running session requires a reload to access its tools. See `../supabase/README.md` for the exact next steps. Do not promote this as completed account support or rebuild an APK with unconfigured account settings.

## 8 October — accounts and desktop refinement
Supabase project provisioned and migration applied. Transaction tests rejected stale writes, wrong-owner writes and malformed payloads; a second account saw zero rows. Anonymous read/write and direct client update grants are absent. Security advisor flags the deliberately authenticated SECURITY DEFINER write RPC; it checks auth.uid ownership, uses an empty search_path and restricts execution. Email flows and full cross-client/native sync remain unverified. Desktop top navigation and split sign-in composition implemented; lint/typecheck and web export passed. Local public environment is ignored by Git.


Configured product browser checks passed at widths 390 and 1440: account page, guest entry, product/download routes, no horizontal overflow and no runtime exceptions. Screenshot reviewed: design/shots/product/1440-account.png. No live signup/password recovery or mobile sync claim is made.


## Live product release — 8 October 2026
Release 1106bca was pushed to main and automatically deployed by Vercel. Production product checks passed against https://ai-engineering-grain-to-mountain.vercel.app at 390px and 1440px: homepage, account preview, download states and guest workspace entry, no overflow or runtime exceptions. Account email flows and end-to-end sync remain unverified; the live account page discloses this. Production/preview public Supabase variables are configured.


## Authentication follow-up — 8 October 2026
Saved the production Supabase Site URL and exact /account redirect through the signed-in dashboard. Custom SMTP form prepared for the owner-selected Gmail sender (smtp.gmail.com, SSL port 465); credentials and Save remain a user handoff. An oversized notebook payload was rejected with zero partial rows; fixtures rolled back. Session restoration now ignores obsolete results after newer auth events and clears recovery mode on sign-out. Full email flows and real two-client sync remain pending SMTP credential setup.

