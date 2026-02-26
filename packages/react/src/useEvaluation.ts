import { useCallback } from 'react';
import type { SciFlow, JsonMap } from '@sci-flow/core';

/**
 * Graph evaluation helpers — execute data pipeline via topological sort.
 */
export function useEvaluation(engine: SciFlow | null) {
  const evaluate = useCallback((): Map<string, JsonMap> => {
    if (!engine) return new Map();
    return engine.plugins.evaluation.evaluate();
  }, [engine]);

  return { evaluate };
}
