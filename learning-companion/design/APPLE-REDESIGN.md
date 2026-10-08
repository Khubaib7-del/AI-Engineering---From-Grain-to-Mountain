# AI Learning: Apple-inspired redesign

The learning workspace now uses a spacious desktop layout and a single-column mobile layout. Content retains solid readable surfaces; translucent material belongs to the floating tab bar and small navigation controls. Blue communicates actions, selection and progress. Graphite text, cool neutrals, continuous corners, system fonts and a restrained type hierarchy unify every route.

## Sources and implementation

- [Apple: Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/) — reviewed the presentation transcript for navigation/content layering and accessibility principles.
- [Apple design introduction](https://www.apple.com/uk/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/) — reviewed the cross-platform design description.
- [Expo 57 BlurView](https://docs.expo.dev/versions/v57.0.0/sdk/blur-view/) — installed blur primitive used for web and iOS; Android receives an opaque surface.

Appllama MCP was not used because the user opted out. Its locally installed design skill informed the process. This cross-platform treatment is inspired by Liquid Glass; it is not Apple's native optical refraction renderer. No new package was needed. No decorative or perpetual animation was added. Glass honors iOS reduced transparency; web includes supported media-query fallbacks and visible keyboard focus.

## Screen decisions

| Screen | Change |
|---|---|
| Today | Responsive lesson/journey composition, clear primary action, meaningful Watch/Build/Recall states and upcoming lessons. |
| Path | Four chapter sections with separate hierarchy, readable module lists and real studied progress. |
| Library | Search, filters, responsive resource cards, consistent type icons and original-resource links. |
| Progress | Three actual progress measures, saved notebook, recall queue and backup action. |
| Lesson | Grouped practice tasks, visible completion state, evidence editor and existing completion gate. |
| Module | Study meter, grouped concept checklists, prerequisite notice and assessment gate. |
| Settings | Grouped appearance/reminder/restore sections and clearer controls. |

Existing lesson/topic identifiers, local storage, assessments, reminders and backup flows are retained. No learning activity or completion data is fabricated. Checks and screenshots are recorded separately; browser rendering does not establish native frame rates or actual iPhone behavior.
