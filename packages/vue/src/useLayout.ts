import type { ShallowRef } from 'vue';
import type { SciFlow, LayoutAlgorithm, LayoutOptions } from '@sci-flow/core';

/** Auto-layout controls for Vue. */
export function useLayout(engine: ShallowRef<SciFlow | null>) {
  const applyLayout = (algorithm: LayoutAlgorithm, options?: LayoutOptions) => {
    if (!engine.value) return;
    const positions = engine.value.plugins.layout.computeLayout(algorithm, options);
    engine.value.plugins.layout.applyLayout(positions);
    engine.value.stateManager.forceUpdate();
  };
  const computeLayout = (algorithm: LayoutAlgorithm, options?: LayoutOptions) =>
    engine.value?.plugins.layout.computeLayout(algorithm, options) ?? new Map();
  return { applyLayout, computeLayout };
}
