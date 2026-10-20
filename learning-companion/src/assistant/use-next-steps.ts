import { useMemo } from 'react';
import { unitIds, weeks } from '../lib/content';
import { useLearning } from '../lib/store';
import { usePath } from '../lib/use-path';
import { computeNextSteps, type NextSteps } from './next-steps';

/** Deterministic now/then plan from progress + weeks.json. Works with no key. */
export function useNextSteps(): NextSteps {
  const { state } = useLearning();
  const path = usePath();
  return useMemo(
    () => computeNextSteps({ units: path.units, weeks, state, known: unitIds, now: new Date() }),
    [path.units, state],
  );
}
