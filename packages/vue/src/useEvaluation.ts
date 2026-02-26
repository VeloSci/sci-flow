import type { ShallowRef } from 'vue';
import type { SciFlow, JsonMap } from '@sci-flow/core';

/**
 * Graph evaluation composable for Vue.
 */
export function useEvaluation(engine: ShallowRef<SciFlow | null>) {
  const evaluate = (): Map<string, JsonMap> => {
    if (!engine.value) return new Map();
    return engine.value.plugins.evaluation.evaluate();
  };

  return { evaluate };
}
