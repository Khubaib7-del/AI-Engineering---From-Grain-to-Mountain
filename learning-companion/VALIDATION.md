# Rebuild validation · 2026-10-20 (branch rebuild/app)

Checked in a Linux sandbox (Debian chromium, headless, isolated profiles; no personal progress).

- `npm run typecheck` and `npm run lint` (Expo ESLint incl. React Compiler rules): clean.
- `npm test`: 33 tests pass — quiz grading (80% pass mark, rubric 2-of-3), unit status, placement, legacy-ID migration via `legacy-map.json` (rename / archive / idempotent / old-backup import), activity log cap, 52-week heatmap, streaks, backfill, guest→account union merge, v2 content contract, Books normalisation, path planner, plus the earlier planner/sync/secure-session tests.
- `npx expo export --platform web`: succeeds.
- `node scripts/flow-check.mjs` against the served export: landing → onboarding (role/level/hours) → Today shows the profile; unit M00.U01 passes only after evidence + 3/3 quiz + rubric self-check, with activity events logged; Map/Progress reflect it; Books tab lists 12+ books.
- `node scripts/capture-rebuild.mjs`: 10 screens at 1440 and 390 px in `design/shots/rebuild/`, no runtime errors, no horizontal overflow.

Not verified here: real Supabase sign-up/confirm/merge round trip (no keys in the sandbox; the Check-your-inbox and You're-confirmed screens were not captured), Android device rendering of the SVG map and PanResponder pinch, `/welcome` being on the Supabase redirect allow-list (a fallback redirects confirmation links that land on `/` to `/welcome`).

Known compatibility note: the cloud payload keeps `version: 1` and adds `profile`, `units`, `capstones`, `activity`, `archivedTopics`, `idVersion` as extra keys, which the existing table check allows (no migration). The published Android 1.2 build ignores those keys; if it pushes after a newer client, the newer keys can be dropped from the cloud copy. Ship the next APK before relying on cross-device unit progress.

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

The curriculum path now contains 21 modules and 777 concepts; 28 daily sessions are authored. Completion and assessments are self-reported, with evidence required for sessions. External lessons are linked rather than hosted or played inside the app.

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


Live HTTP check (scripts/sync-access-check.mjs) passed: Auth settings reachable, email enabled, automatic confirmation disabled, anonymous notebook SELECT and RPC writes denied. The committed supabase/tests/notebook-access.sql replay passed against the hosted project and rolled back its fixtures.


## SMTP delivery test — 8 October 2026
User saved a Google app password in Supabase. First delivery failed with Gmail 535 BadCredentials because sender/username did not match the account that generated it. Corrected the non-secret sender/username to the user-specified account, retaining the stored password. A dedicated test signup was then accepted. Sign-in remains correctly blocked until the owner clicks its email confirmation. Test credentials are in ignored .env.auth-test.local; never commit or print that file. scripts/account-live-check.mjs and account-browser-check.mjs are prepared; successful authenticated sync is not yet claimed.


## Confirmed-account sync — 8 October 2026
Confirmed test account signed in through two independent API clients. Shared snapshots, wrong-owner denial and stale-write rejection passed. Live testing found the documented PostgREST SQLSTATE 40001 retry loop; migration 20261008125444_notebook_conflict_http_status.sql now returns PT409 (HTTP 409). Client recognizes PT409 and disables automatic write retries. Typecheck, lint, all 10 unit checks and web export passed. Browser checks against the rebuilt local export and hosted backend passed at 390/1440px: sign-in, note sync, offline preservation, explicit cloud conflict selection, sign-out to guest. One initial browser sign-in wait timed out; the diagnostic rerun passed without an application change. Password recovery email accepted; final password-save check awaits owner interaction.


Recovery completed through the public website: hosted Auth recorded successful PUT /user, and the original test password was subsequently rejected with invalid_credentials. Gmail delivery was confirmed by the owner receiving the confirmation email. Web account functionality is verified; downloadable native app sync is not claimed. The test credentials file remains ignored; old password is no longer valid.


Final public product checks passed after release: /, /account, /download and /today at 390/1440px, guest entry, no overflow/runtime exceptions; live Auth access checks passed. Public account screenshot reviewed with the preview notice removed. Functional account release a29ed51 reached Vercel Ready; subsequent Git-ignore-only release does not change app behavior.


## Android accounts and sync — 8 October 2026

Implemented encrypted SecureStore chunks for large sessions, preserving the committed session if a refresh write fails. Native foreground refresh starts immediately; web uses its browser lifecycle. Backend requests are bounded to 15 seconds. A first sign-in with no notebook cache pulls the cloud snapshot before exposing editable empty progress; cached/offline notebooks remain available. Version is 1.1.0/code 2.

Typecheck, lint, all 13 unit checks and the 4.7 MB web export passed. Final desktop/mobile product checks and independent browser account checks against the rebuilt app plus hosted backend passed. The Windows build initially failed in native dependencies with Ninja's dirty-manifest loop; the reproducible Expo plugin now applies official verified project-local Ninja 1.13.1 to native libraries as well as the app. SDK binaries were not changed. The final x86_64 app build passed (532 tasks, 33 executed after the prior full build).

Installed the new x86_64 APK over the old 1.0 emulator APK. A seeded guest note survived the update and was copied to the account only after explicit import. Real native sign-in, web-to-Android notes, Android-to-web notes, encrypted session cold launch, offline SQLite notes/session cold launch, reconnection conflict detection and explicit cloud choice passed against the hosted backend. The full driver initially stopped on its final sign-out assertion because it navigated before asynchronous sign-out completed. The corrected targeted --account-exit check passed native sign-in, completed sign-out, and the unchanged original guest note. Driver corrections cover input targeting, keyboard dismissal, distinct links, initial sync and stale UI dumps. Transient UiAutomator null-root messages during remount were test-driver output, not app runtime failures.

Reviewed native account screenshot: design/shots/android-sync/account.png. Tests use only a disposable +grain-native account and isolated emulator/browser data. Keep fixture-mutating browser/native checks sequential. The owner separately reported the old ARM64 1.0 APK running on two phones; that report does not validate 1.1 physical-device sync. New phone artifact/signature/hash is recorded below after its build. Native iOS remains unbuilt and untested.

The disposable native fixture was removed after successful checks using an exact ID/email/purpose guard; its ignored local credentials file was deleted. No personal account or notebook was changed.

## Android 1.1 phone artifact

ARM64 :app:assembleRelease completed successfully in 10m 3s (532 tasks, 60 executed, 472 up-to-date). Packaged releases/AI-Learning-1.1.0-android-arm64.apk: 48,508,315 bytes; SHA256 282cd568566b979c65ad0ffd64eb9a127d719d5c0b0a4e84342ac17f6f9eb2b9. APK v2 signature verifies. Signing certificate SHA256 fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c matches the published 1.0 APK, enabling an in-place update. Manifest: com.khubaib.ailearning, version 1.1.0/code 2, min SDK 24, target SDK 36, ARM64 only. Archive checks verified bundled JS, ARM64 native libraries and hosted public account configuration. This is personal test signing; physical ARM64 sync and notification verification remain device checks.

Release v1.1.0-preview.1 is public with APK and SHA256SUMS attachments. Public APK HTTP 200, server digest and 48,508,315-byte size matched the validated file. Initial PowerShell upload connection closed before creating an asset; inspected the draft, then HTTP/1.1 upload succeeded. Functional commit 3efa4f0 reached Vercel Ready/promoted (dpl_5wZ5SKtf7vhbCJ1V56xyKqkwgkRR). Live production desktop/mobile product checks and anonymous Auth access checks passed. The public download page displayed version 1.1 and its button requested the exact published APK URL. Vercel MCP scope access failed; the already-authorized CLI successfully verified the deployment. New source/scripts contain no user credentials, APK or signing key.


## Guided curriculum refresh — 17 October 2026

Revised all 21 module guides into distinct Learn → Read → Practice resources; integrity check found 63 unique required links and no repeats. Repointed ISLP to its Stanford chapter lectures and Python labs, corrected the Full Stack LLM route to its course materials, and refreshed the official MLOps Zoomcamp playlist. Added official DeepLearning.AI Agentic AI, post-training and Generative AI courses. Added tracked checkpoints for pretraining/inference, post-training, harness engineering, agent evaluation and operations. The curriculum is now 777 concepts and estimates 1,800 hours. After the 28 guided lessons, learners can open any module; prerequisites gate assessment only. Existing module assessments retain their completed concepts and can be refreshed after studying newly added checkpoints.

TypeScript, ESLint and the Expo web export passed. The 1.2 ARM64 Android build completed 576 Gradle tasks; APK v2 signature verification passed. Package is `com.khubaib.ailearning`, version 1.2.0/code 3, min SDK 24, target SDK 36, ARM64 only. Certificate SHA256 `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c` matches 1.1; packaged APK SHA256 `9bbba7d69fce27edf9a1400412dbb17c88a550fcfe65069f6f916cfd4d4f8794`. Android 1.2 has not yet been installed on a physical phone; iOS remains unbuilt. Course source pages and syllabuses were checked; full recordings and repository experiments were not reproduced.

Release `v1.2.0-preview.1` is public with the ARM64 APK and checksum. GitHub reports 48,520,039 bytes and a SHA256 digest matching the local verified artifact. Vercel deployment `dpl_7HNzpv9Xo5qrMrbS1ZmFJDG7y63N` reached READY and carries the production alias. Live browser checks confirmed `/path` reports 777 concepts and lets a module open ahead of its prerequisites, `/module/M07` shows the Stanford Learn → Read → Practice links, and `/download` advertises version 1.2. These checks did not install the new APK on a physical phone.

## Full v2 content — 20 October 2026 (branch rebuild/v2, not deployed)

The synced v2 curriculum (23 modules M00–M22, 295 units, 158 weeks, 756 resources incl. 38 books) replaced the two-unit fixture. Logic tests now use inline fixtures (`tests/helpers/fixture.mjs`); `tests/content.test.mjs` enforces docs/v2-content-schema.md on the real bundle. That contract found and the data now fixes: 141 MCQs in M01–M04 with empty explanations, M12.U20 placed before its prerequisite M12.U21, M17.U08 requiring M22.U11 (scheduled 8 weeks later), M03.U16–U18 scheduled before their SQL prerequisite M04.U06, and 228 unit `week` fields that disagreed with or were missing from weeks.json. `npm run typecheck`, `npm run lint` and `npm test` (38 tests) pass.

`npx expo export --platform web --output-dir dist` succeeded; screens were captured from `scripts/serve-preview.mjs` with Playwright's ARM64 headless Chromium 133 at 1440×1000 and 390×844 into `design/shots/rebuild/` (landing, onboarding, placement, today, map, unit M01.U01, module M01, progress, library-books, signin, settings). No runtime errors or horizontal overflow; long screens were reviewed with `scripts/scroll-check.mjs`. The clustered map draws ~300 SVG elements (vs ~1,600 unclustered) and a 30-step drag completed in ~0.5 s headless; this is not a measurement on a low-end phone. Not done: Android/iOS builds of v2, Vercel deployment, live link checks of the 756 resources, physical-device checks.

## Ascent identity (branch identity/ascent, 2026-10-21)

- `npm run typecheck`, `npm run lint` (0 problems) and `npm test` (54/54) pass. New tests: `tests/theme.test.mjs`
  (mode normalisation, system resolution, theme persisted through save/parse, legacy light/dark, AA/AAA
  contrast of every palette, deterministic procedural art) and `tests/bubbles.test.mjs` (Mote's Now/Then
  bubbles from next steps, dismissal, clipping, mood, gaze); `tests/planner.test.mjs` adds the
  "Week N of M · H h left this week" label.
- Web export built with `npx expo export --platform web --output-dir dist` and served by
  `scripts/serve-preview.mjs`; `scripts/capture-ascent.mjs` captured 58 screenshots in
  `design/shots/ascent/` (15 screens × Dawn/Dusk × 1440/390, plus landing in Terminal) with no runtime
  errors and no horizontal overflow. High-contrast Today was spot-checked.
- The chat runs against `src/assistant-stub.ts` (fake streaming text). Real provider calls, key storage and
  `useNextSteps` come from the engine branch; swap the re-export in `src/ui/assistant-api.ts` at merge.
- Not checked on a physical phone: Geist loading on native, Mote animations under Reanimated 4 on Android,
  and touch-gaze. Native draws the same art statically (no canvas/WebGL is used).
