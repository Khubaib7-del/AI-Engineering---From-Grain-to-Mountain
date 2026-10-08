# AI Learning: a workbench for building understanding

Brief supplied by the user: a cross-platform personal learning app, beginner to advanced AI engineering, real courses, daily reminders, progress and projects. iPhone-quality design, Android support. Remaining visual decisions are self-authored; no paid images used. Name stays AI Learning, provisional.

## Exploration
Three rendered directions: printed field guide (light, serif, orange, typographic illustration); observatory (dark, grotesque, blue, orbital shape); workbench (colour-field, rounded, teal, colour material). Workbench selected: three physical pieces represent watch/build/recall. Field guide feels like a textbook; observatory makes early learning feel distant. The actual application uses platform System typography, rounded corners and weight rather than redistributing Apple fonts. Windows mockups fall back to Arial; SF Pro cannot be verified here.

## Tokens
Light ground #F4F7F5, surface #FFFFFF, ink #17382F, secondary #53695F, separator #D8E4DC. Teal #075C51 denotes the next action; mint #C8EFDB represents work already assembled. Dark ground #101E1A, surface #182C24, ink #EFF6F1, secondary #A4B8AE, separator #354F43, action #B4E8CE. Hero remains deep teal in both themes. Danger #AD342E, only errors. Type sizes 48/38/25/20/17/14/12, weights 400/600/700/800, display tracking -1.4. Margins 24, spacing 4/8/12/16/24/32/48. Radii 12/20/28. Icons use Ionicons outlines, never emoji. All controls at least 44 points. Font scaling enabled, content scrolls.

## Refused defaults
No points, fake streaks, greeting, competing dashboard tiles, purple AI glow or decorative brain. No austere grey-paper ledger. The core action is the lesson; progress describes work completed, never claims expertise from clicks. No claim to have surveyed the top three apps: this is an explicit design choice, not a competitive audit.

## Content and states
Today: date; AI Learning; settings; “Small steps. Real skills.”; “DAY 01 / FOUNDATIONS”; “Orientation and your first program”; “90 min · Watch, build, recall”; three labelled pieces; “Open lesson”; “The first 28 days”; first three actual manifest lessons; “Your pace, without a deadline.” First run: no work completed, reminders disabled, local-only data.
Session: day/title/estimated time; course link; three exact manifest task descriptions; evidence text field; save notes; complete lesson requiring every task and evidence. Completion: assembled three pieces and “Work saved”; next lesson remains separate navigation. Curriculum: 21 modules, grouped by phase; hours as estimates, topic counts, prerequisites and gate; topic checks mean studied, module verification means self-confirmed assessment.
Library: search and course/book/paper/video filters; actual resource titles, English/Hindi metadata where available; opens external source, no completion on visit. Progress: completed lessons, studied topics, verified modules, saved evidence; review queue at 1/3/7/14 days; backup/export. Settings: theme, 1–4 reminder times, study weekdays, quiet hours, opt-in permission, test notification, import JSON backup. Native notifications only. First 28 daily sessions are authored; beyond that, use module assessments, not fabricated daily lessons.

## Signature storyboard
Task toggle changes the corresponding piece from outlined/short to filled/tall in a 320 ms spring. All three assembled means ready to record evidence. Saving completion plays a single success haptic and reveals “Work saved”; no confetti. Reduced motion renders final state immediately. Pieces visibly retain textual Watch/Build/Recall labels, so meaning survives monochrome and screen readers. Native haptics and timing need phone testing.

## Platform and history
React Native + Expo Router + TypeScript, shared iOS/Android/web views, native safe areas, system back navigation, native notifications and SQLite; web uses localStorage and has no reminder delivery. Glass only on iOS/web navigation; opaque Android navigation. Local design history is kept here rather than writing outside the authorized workspace. No prior local history exists. Mockups include first run, lesson, path, progress, dark core, signature and icon; Library/Settings verified in the actual application.
