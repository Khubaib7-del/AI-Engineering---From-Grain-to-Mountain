# Personal learning companion: later app specification

Status: specification only, 2026-10-07. The app is not built or installed, and no reminders are active. Its job is to turn this curated curriculum into a small daily assignment and an honest record of progress.

## Intended outcome

An Android-first cross-platform app tells you what to study next, opens the correct lesson, asks for a small implementation and recall exercise, and adapts when you miss a day. It should make your study easier without becoming another large project that delays learning.

MVP success: you can import the first-month plan, see today’s assignment offline, receive a chosen reminder on a physical Android device, record evidence, and resume correctly after restart. Track whether assignments are completed and understood; do not optimize notification count or streak length.

## Daily experience

1. Onboarding: choose start date, weekly study days, session length, time zone, language and notification times.
2. Today: one lesson with why it matters, prerequisite, video/reading link, build task, recall prompt and time estimate.
3. Study: open the official lesson externally; return and manually record watched/read, attempted, explained and evidence.
4. Assess: complete an independent change or recall question; mark mastered only with evidence.
5. Review: show one or two due concepts, then the next eligible task.
6. If busy: snooze, reduce scope or move the session; keep the next task’s prerequisite intact.

A “notify throughout the day” mode is available as an explicit preference: morning assignment, chosen study-time reminder, optional midday check-in and evening review. Default to two chosen reminders, allow 1–4, provide quiet hours and a single-day pause. Preview the messages before enabling them. A missed session moves the next task forward; avoid stacking four overdue reminders.

Example messages: “Today: Python conditions. Open CS50P week 1, build a boundary check, then explain your tests.” Evening: “Recall: when does elif run? Add your answer or reschedule.” Each notification deep-links to its actual task.

## MVP versus later

| MVP | Later |
|---|---|
| Curated manifest import with version validation | Optional encrypted cross-device sync |
| Today/plan/topic map/resource browser | AI explanations grounded in curated resources |
| Local offline progress and evidence notes | Adaptive assessments with calibrated grading |
| Configurable local reminders | Remote notifications for synchronized assignments |
| Manual resource completion and recall | Optional calendar integration |
| Missed-day rescheduling and review queue | Full lesson segmentation for all stages |
| JSON/CSV export, backup and restore | Community/mentor review and curated additional languages |

Do not scrape private accounts or pretend to measure YouTube watch completion. Watching external videos is manually acknowledged in the MVP. Do not host copyrighted videos/books; open their authorized pages. Local notes can contain sensitive learning/work material, so analytics and cloud upload should be optional.

## Screens

**Today:** assigned concept, why/prerequisite, lesson link, checklist, evidence field, done/snooze controls.

**Curriculum map:** module order, prerequisites, concepts, current state and checkpoint. Show unfamiliar branches as optional rather than blocked distractions.

**Resources:** course/book/paper filtered by stage, with access and freshness notes.

**Progress:** attempted versus explained versus mastered, project evidence, review dates and remaining planning hours.

**Settings:** study days, reminder times, quiet hours, time zone, pause, export/delete and optional sync.

Use accessible type sizes, clear loading/error/empty states and visible next steps. A video click must not mark a concept mastered.

## Provisional implementation route

React Native with Expo, TypeScript, expo-sqlite for local persistence and expo-notifications for local scheduling. This matches a later web/TypeScript skill branch and supports Android/iOS. Flutter is a reasonable alternative, but one stack should be chosen before implementation.

A backend is unnecessary for the offline personal MVP. Use versioned JSON content bundled with the app or imported from a trusted file. Add a small API/sync service only if multiple-device use becomes necessary. AI model access is unnecessary for basic scheduling.

Official sources checked: [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) and [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/). Pick compatible supported releases when implementation begins rather than freezing a guessed version now.

## Android notification behavior to account for

Android 13 notification opt-in is described in the Expo documentation. Create the appropriate notification channel and request permission after showing why reminders help. If permission is denied, Today and the study queue remain usable and Settings explains how to enable reminders.

Use local scheduled notifications for reminders. Remote push requires additional infrastructure and, on Android, a development build for Expo’s push capability rather than assuming Expo Go supports it. The notification documentation distinguishes local notifications from remote push.

Do not promise exact delivery under battery optimization, device shutdown or force-stop. Avoid depending on exact-alarm privileges for an ordinary study reminder. Android background work is for deferrable work rather than a guarantee of a precise clock time. Recheck the current platform rules and test on the actual device at implementation time. [Android WorkManager documentation](https://developer.android.com/develop/background-work/background-tasks/persistent/getting-started), [Expo notification permissions and scheduling](https://docs.expo.dev/versions/latest/sdk/notifications/).

## Data model

| Entity | Key fields |
|---|---|
| CurriculumVersion | version, preparedAt, sourceAuditVersion |
| Module | stable ID, title, prerequisite module IDs, checkpoint, estimated hours |
| Topic | stable ID, module/group, concept, prerequisite overrides, resource IDs |
| Resource | ID, title, URL, type, language, access, freshness, verification status |
| Lesson/Day | ID, title, resource URL, task list, expected evidence, minutes, prerequisite IDs |
| Assignment | lesson ID, planned local date, status, reschedule reason |
| Attempt | task/topic ID, timestamp, confidence, explanation, artifact path/link |
| Mastery | topic ID, demonstrated state, last assessment, reviewer/evidence |
| Review | topic ID, due local date, last recall result |
| Reminder | unique ID, assignment ID, local time, timezone, enabled |
| Preferences | study days, quiet hours, notification slots, start date, privacy choices |

Inputs already supplied: data/curriculum.json, courses.json, papers.json, tool-registry.json and first-28-days.json. The first month has concrete daily tasks. The remaining 740-concept map is a curriculum checklist, not 740 finalized daily lesson scripts; later modules need curated lesson segmentation before scheduling them.

## Scheduling rules

A deterministic planner selects only tasks with completed prerequisite assignments, fits them to your time budget and adds due reviews. Store UTC event timestamps plus local date/time zone for assignment/reminder intent. Default timezone is Asia/Karachi, but allow travel changes.

Completion is idempotent. Rescheduling cancels/replaces the previous reminder ID. On app launch, verify the next scheduled assignments and reconcile notifications without duplicating them. Reboot, timezone changes, curriculum migrations and notification denial must not lose progress.

Use 1/3/7/14-day recall intervals as a configurable initial heuristic. Incorrect recall shortens the interval and creates a review task. Do not require completion of an unrelated optional branch before a core lesson.

## Acceptance tests for the later build

- Fresh install imports a valid manifest; duplicate IDs/cycles/unknown references produce an understandable error.
- Offline launch shows assignments and saves progress; restart preserves evidence.
- A physical-device local notification opens the correct lesson.
- Permission denial, later grant, snooze, reschedule, quiet hours and timezone change work.
- Rescheduling/curriculum updates do not duplicate reminders or completed tasks.
- A missed day leaves prerequisite order intact.
- Export/restore recovers progress; deletion removes local user data.
- External video opening does not automatically claim understanding.
- Accessibility font scaling does not hide the primary controls.

## Build order when we reach this stage

Prototype Today and manifest import → SQLite progress → planner → local notifications on physical Android → reviews and export → usability trial → optional sync/AI. First validate with your own four-week routine. This app is a later project with a concrete specification; the current learning work starts with Python.

