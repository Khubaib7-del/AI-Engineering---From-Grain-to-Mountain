# Design review

One fresh critic, requested explicitly by the user-provided App Designer skill, reviewed all eight full-size PNGs each round. No physical-device claim is made.

| Rubric | Round 1 | Round 2 |
|---|---:|---:|
| Concept on the pixel | 4 | 4 |
| Not category average | 4 | 4 |
| Not skill average | 4 | 4 |
| Hierarchy | 3 | 4 |
| Typography | 3 | 3 |
| Colour | 4 | 4 |
| Richness | 4 | 4 |
| Rhythm/space | 3 | 4 |
| Craft | 2 | 3 |
| Native fluency | 3 | 3 |
| Signature | 3 | 4 |
| Feature test | 3 | 4 |

Round 1 not done: repeated tab glyphs, clipped first-run CTA, slogan above actual lesson, large intro/illustration blocks, incomplete signature storyboard. All five asks landed in Round 2. Round 2 meets the skill stop rule: none below 3 and nine of twelve at 4. Typography/native fluency remain 3 because these Windows renders do not prove actual iPhone fonts/materials. Craft 3: stage-three pieces shrank in the storyboard.

Post-review concrete correction: third-stage pieces now retain fixed height and the panel allows space for “Work saved”. Also removed unexplained 09:00 from header, tightened header spacing and added small-frame container queries. Round 3 is a mechanical/visual correction, not rescored; Round 2 scores are not represented as applying to unreviewed changes. Latest sheets: `shots/r3/sheet.png` and `shots/r3-small/sheet.png`.

## Scan and visual limitations

The scanner reported zero FAILs in both reviewed rounds, large and small renders. Safe-area warnings name text inside deliberately scrolling lists: the elements exist beyond the scroll viewport, are clipped/faded before navigation, and can be scrolled into view. These are answered as intentional scrolling, not hidden defects claimed fixed. Native content uses bottom padding, while scroll behavior and real small-phone layouts are checked separately in the web preview.

Device kit attempts to load Apple SFNS.ttf from a Mac path. It is unavailable on Windows; mockups explicitly use Arial fallback. Actual RN uses System, which must be inspected on iPhone. No Apple font was copied or distributed. Motion/haptics cannot be evaluated from static PNGs. The signature remains an implemented task-state spring with reduced-motion fallback, not a promotional animation.

App Designer history is workspace-local due to write permissions. User cross-platform instruction supersedes the skill's SwiftUI-only build suggestion. “First run” is a design illustration; the working app opens Today with zero progress and reminders disabled, without a separate onboarding route.
