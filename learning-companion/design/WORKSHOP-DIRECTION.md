# Personal workshop: expressive interface and motion

This direction responds to the user's preference for a personal, creative space rather than a conventional education dashboard. The product name remains AI Learning. A workshop metaphor now connects experiments, a practice board, a curiosity shelf, field notes and a chapter atlas.

## Reference study

UIArc's public button page was inspected in the browser, and six public component Markdown references were retrieved. These informed original Expo/Reanimated implementations; the DOM/shadcn components were not directly installed or represented as native components.

| Reference | Applied lesson |
|---|---|
| [Button](https://uiarc.dev/components/button) | Short press spring, visible feedback and a reduced-motion alternative. |
| [Action button](https://uiarc.dev/components/action-button) | Show actual save progress and completion in the control; no simulated successful operation. |
| [Expanding button group](https://uiarc.dev/components/expanding-button-group) | Group related actions into one deliberate interactive surface. The app keeps labels visible for discoverability. |
| [Tabs](https://uiarc.dev/components/tabs) | Sliding selection surface and related content transitions. |
| [Expandable card](https://uiarc.dev/components/expandable-card) | Resource summaries reveal optional detail in place. |
| [Animated counter](https://uiarc.dev/components/animated-counter) | Data motion should explain change. We retain exact counts and animate progress rather than adding decorative count-ups. |

Implementation references: [Lucide React Native](https://lucide.dev/guide/react-native), [Expo SVG](https://docs.expo.dev/versions/v57.0.0/sdk/svg/), [Reanimated springs](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/). Apple-inspired spacing and legibility remain, while the user explicitly requested more expressive color and composition.

## Visual system

Warm paper, ink, rust-orange action color, with sage/lilac/ochre surfaces for distinct content categories. Dark mode uses forest-charcoal with peach accents. Lucide supplies one consistent stroke vocabulary. The orbit graphic is a small interactive diagram of Watch/Build/Recall; it changes the displayed task, not completion state. The practice board represents the actual 28 authored days.

## Motion inventory

- Press: 0.97 scale; stiffness 380, damping 30, mass 0.7; reversible on release.
- Hover: 2px lift on pointer-capable controls.
- Navigation: shared selection slides to the active destination.
- Practice modes and resource filters: shared selection and short content reveal.
- Resource details: expanded state is announced; content only enters the accessibility tree when open.
- Save notes: real Saving/Notes saved feedback; changes fade into place.
- Progress: 350ms transition to actual stored values.
- Reduce Motion: no press displacement, selection jumps to its position, progress updates directly and reveals use a short fade.

## Preservation

The original curriculum, progress IDs, local persistence, completion gates, prerequisite previews, theme choice, reminders and backup flows stay functional. Category filtering operates over the whole resource catalog; cards render in batches of twelve with an explicit load-more control. Nothing marks learning complete automatically.

Native device performance is not established by browser checks. Validation must include actual web interactions and screenshots, not only TypeScript or static code review.
