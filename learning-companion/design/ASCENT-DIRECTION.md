# Ascent — visual identity (2026-10-21)

Replaces the black-monochrome direction (`MONOCHROME-DIRECTION.md`, now historical).

## Why
The owner liked the structure but found the monochrome identity flat and pages overwhelming. Ascent adds
gradients, dither and ASCII art, four colour modes, larger text and one clear next step per page.

## Modes (`src/lib/palettes.ts`, `src/lib/theme.ts`)
| Mode | Background | Text | Accent |
|---|---|---|---|
| Dawn (light) | warm paper `#F6F1E7` → pale sky `#DDE7F3` | ink `#14161A` | cobalt `#2F5BEA` |
| Dusk (dark) | `#0B0F17` → `#1B2433` | `#EEF1F5` | ice blue `#7CC4FF` |
| Terminal | pure black | `#F4F4F4` | white; mono headings, `>` buttons, `[tab]` |
| High contrast | white | black | `#0030C0` (AAA) |

System (default) resolves to Dawn/Dusk from the device. The choice is a device setting saved with the
notebook (never synced). Old `light`/`dark` values load as Dawn/Dusk. `tests/theme.test.mjs` keeps every
text token at AA (contrast mode at AAA) on bg, surface, raised and both gradient stops. No orange, green or
purple primaries.

## Type
Geist (text) and Geist Mono (labels, IDs, data, ASCII) via `@expo-google-fonts`, loaded in the root layout
(web shows a system fallback while loading; native waits). `Txt` applies a readability floor: 13→15,
14/15→16, 16→17 px; body copy is 17 px; line length kept under ~70ch with `maxWidth`.

## Art (all procedural, `src/lib/dither.ts`, `src/components/art.tsx`)
- `Backdrop`: the mode gradient plus a faint Bayer-dithered haze at the foot of every screen.
- `AsciiMountain`: landing hero. On web the light source follows the cursor and stars drift with scroll
  (requestAnimationFrame-throttled). Reduce-motion and native render it still.
- `DitherMountain`, `DitherBand`: ordered-dither pictures drawn as ONE SVG path (cheap on native).
- `AsciiRule`: small dividers. `Contours`: faint topo lines used only as map texture.
References studied: uiarc.dev (segmented control, accordion/disclosure, chat thread, code block, empty
state, sentence case), React Bits Dither/ASCIIText, Magic UI, shadcn/ui, Aceternity. Ideas were ported to
React Native primitives; no WebGL is required, so web and native draw the same art.

## Mote (`src/components/mote.tsx`, `mote-host.tsx`, `src/lib/bubbles.ts`)
A round grain of sand in 16×16 dithered pixels (original design). Blinks, looks toward the cursor or tap,
bobs, celebrates when a unit passes, falls asleep after 90 s idle. Lives bottom-right (above the tab bar on
phones). Speaks `useNextSteps()` as "Now: …" / "Then: …" bubbles — tap to go, × to dismiss until the step
changes, "Tell me more" opens chat. Phones show a one-line peek; tips fold away after 20 s.

## Chat (`src/components/chat/*`)
Desktop side panel / phone full sheet. Streaming markdown with code blocks (copy on web), suggested prompts
grounded in the current unit, `context: M01.U01` chip, stop and regenerate, Mote empty state. Setup: paste
key → provider detected from its prefix (chip) with manual picker fallback → model prefilled → Connect →
Connected state. Clear on-device key note. The UI talks to the engine only through
`src/ui/assistant-api.ts` (currently re-exporting `src/assistant-stub.ts`; switch to `../assistant` at merge).

## Overwhelm fixes
Every page leads with ONE `NextStepCard`. Covers, gaps, topic checklist, outcomes, quiz, rubric, week plan,
day-by-day and field notes sit behind plain-language `Disclosure`s. Unit steps are collapsible with only the
current one open. Badges reduced to one mono meta line. Progress reads "Week 3 of 12 · 4 h left this week".

## Map
`RouteBoard`: flat, level lines — one line per phase (horizontal on desktop, one vertical line on phones),
stations with icon AND shape per state (done ●✓, in progress ◉ timer, ready □→, locked dashed □ lock,
capstone ◇ flag), labels horizontal on solid plates, Mote marks the current module, contours are texture
only. No perspective, no descending lines. List toggle kept.

## Screens captured
`design/shots/ascent/<mode>-<width>-<screen>.png` via `scripts/capture-ascent.mjs`.
