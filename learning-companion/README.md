# AI Learning

A personal cross-platform learning companion for iPhone, Android and web. The application bundles the researched curriculum from the parent folder. Its design follows the supplied App Designer skill, adapted to React Native rather than SwiftUI.

Implemented: Today, curriculum Path, searchable Library, Progress, module/topic details, 28 daily lessons with Watch/Build/Recall tasks and saved evidence, self-assessment gates, recall queue, light/dark/system theme, native local reminders, JSON backup export/import. Thirty supplementary video/learning resources include CampusX, Krish Naik, Karpathy, freeCodeCamp, CodeWithHarry and university recordings. The paper catalog now contains 28 entries. No account or backend is needed.

## Run locally

Guided-learning update (8 October 2026): all 28 daily lessons display a named assignment, matching notes, a small starting step and a stopping condition. All 21 module pages include a primary resource, reading and optional explanations hidden by default. The supplementary catalog now contains 30 entries. See [the free learning route](../24-guided-free-learning-route.md). Course material is free; API/compute costs and optional certificates are separate.

From the repository's `learning-companion` directory:

```powershell
npm ci
npm run start
# Browser preview:
npm run web
```

Use the QR from Expo on a compatible phone or run a development build. Native features require phone testing. Web stores progress in localStorage; native builds use SQLite. The browser preview does not send reminders. Resources open their original websites and need internet. Lessons and saved progress are available offline in the installed app.

## Content and study model

The additional eight depth units and 58 checkpoints are documented in [the parent coverage audit](../15-coverage-audit-and-learning-extensions.md). They are not yet individual tracked app lessons; existing topic IDs and personal progress remain stable. This pass updates Library content, not the UI design.

`npm run sync-content` copies the eight source JSON files in the parent `data` folder into `src/content`. The complete path is 21 modules and 740 concepts. Only the first 28 daily sessions are authored; after that, continue through modules and assessments. Hours are planning estimates, not a deadline. Checking a concept means studied; self-assessment means you confirmed the exercise. Neither is an independently graded qualification.

A lesson needs all three tasks and at least one sentence of evidence before completion. Recall intervals are 1, 3, 7 and 14 days after completion. Reviews are manually confirmed. No AI-generated mastery judgment is used.

## Reminders

Opt in from Settings on Android/iPhone. Choose 1–4 times, weekdays and quiet hours in the device's local timezone. The app schedules the current unfinished lesson for up to seven days, skips elapsed/quiet times and reconciles its own notification IDs when progress or settings change. Reopen weekly to refresh the schedule; this prototype has no server or guarantee of reminders indefinitely while unopened. Phone permissions, focus modes and Android battery policies affect delivery. Test notification fires after 10 seconds. Tapping a lesson notification opens that lesson. Remote push is not implemented.

## Backups and privacy

There are no analytics, ads, user accounts or cloud sync. Notes and progress stay on the device/browser. External resources follow their hosts' policies. Export from Progress before clearing app data or moving devices. Native export uses the phone share sheet to share JSON text; web downloads a JSON file. Import by pasting that JSON in Settings, then explicitly confirm replacement. Format, IDs, fields and prerequisite integrity are checked. Imported reminders are disabled until enabled on the new device. Stored data is not encrypted by this prototype.

## Checks

```powershell
npm run typecheck
npm run lint
npm test
npx expo-doctor
# Export, then serve the production preview on port 8090:
npx expo export --platform web --output-dir dist
node scripts/serve-preview.mjs
# In a second terminal:
node scripts/browser-check.mjs
```

Browser checks use installed Chrome and an isolated fresh profile. They create sample work only in that profile, not the user's notebook. Design mockups and screenshots are under `design`; browser screenshots under `design/shots/app`. `design/CRITIQUE.md` records the independent review and platform limitations.

## Installable builds

`eas.json` includes an internal Android APK profile. After account/project/signing setup, use `npx eas-cli@latest build --platform android --profile preview`. iPhone distribution needs Apple signing credentials; use a compatible phone with Expo Go for early local iteration or configure a signed development/production build. No EAS job, store submission or account login was performed. `development` profile requires installing `expo-dev-client` with `npx expo install expo-dev-client` before building it. EAS commands can create remote jobs and costs, so their setup is documented rather than triggered by this local prototype task.

## Remaining release work

Verify native SQLite persistence, font scaling, keyboard/safe areas, haptics, screen-reader navigation and reminder delivery on an actual Android phone and iPhone. Validate a signed build before distributing it. Web interaction checks cannot substitute for these. Remote backup/sync, adaptive scheduling beyond 28 days, in-app video playback, automatic grading and push infrastructure are future features.

Dependency audit now reports 21 affected packages after the scoped Xcode UUID fix, down from 28. Three root advisories remain. See [dependency security review](DEPENDENCY-SECURITY.md) for the unresolved release blockers and [validation](VALIDATION.md) for checks. Do not force npm's suggested downgrade of Expo 57 to 44 or mix Expo Router 58 into SDK57.

