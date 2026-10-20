// What Mote says. Pure so tests can check the bubble content without rendering.
export type StepLike = { id: string; label: string; detail?: string; href?: string; kind: string };
export type Bubble = { key: 'now' | 'then'; prefix: 'Now' | 'Then'; text: string; href?: string; id: string };

export const BUBBLE_MAX = 72;
export const clip = (s: string, n = BUBBLE_MAX) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** "Now: …" then "Then: …". Hidden once the learner dismisses the current step. */
export function nextStepBubbles(
  steps: { now: StepLike; then: StepLike[] } | undefined,
  dismissedId?: string,
): Bubble[] {
  if (!steps?.now || dismissedId === steps.now.id) return [];
  const out: Bubble[] = [
    { key: 'now', prefix: 'Now', text: clip(steps.now.label), href: steps.now.href, id: steps.now.id },
  ];
  const then = steps.then.find(t => t.id !== steps.now.id);
  if (then) out.push({ key: 'then', prefix: 'Then', text: clip(then.label), href: then.href, id: then.id });
  return out;
}

export type MoteMood = 'idle' | 'celebrate' | 'sleepy';
export const SLEEP_AFTER_MS = 90_000;
/** Celebrate wins over everything; sleepy after a quiet spell; otherwise idle. */
export function moteMood(now: number, lastActive: number, celebrateUntil = 0): MoteMood {
  if (now < celebrateUntil) return 'celebrate';
  return now - lastActive > SLEEP_AFTER_MS ? 'sleepy' : 'idle';
}

/** Eye offset (in pixels of Mote's grid) toward a point: -1, 0 or 1 on each axis. */
export function gaze(dx: number, dy: number, dead = 24): { x: -1 | 0 | 1; y: -1 | 0 | 1 } {
  const sx = Math.abs(dx) < dead ? 0 : dx > 0 ? 1 : -1;
  const sy = Math.abs(dy) < dead ? 0 : dy > 0 ? 1 : -1;
  return { x: sx as -1 | 0 | 1, y: sy as -1 | 0 | 1 };
}
