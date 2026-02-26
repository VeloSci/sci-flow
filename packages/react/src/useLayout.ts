import { useCallback } from 'react';
import type { SciFlow, LayoutAlgorithm, LayoutOptions } from '@sci-flow/core';

/** Auto-layout controls. */
export function useLayout(engine: SciFlow | null) {
  const applyLayout = useCallback((algorithm: LayoutAlgorithm, options?: LayoutOptions) => {
    if (!engine) return;
    const positions = engine.plugins.layout.computeLayout(algorithm, options);
    engine.plugins.layout.applyLayout(positions);
    engine.stateManager.forceUpdate();
  }, [engine]);

  const computeLayout = useCallback((algorithm: LayoutAlgorithm, options?: LayoutOptions) => {
    return engine?.plugins.layout.computeLayout(algorithm, options) ?? new Map();
  }, [engine]);

  return { applyLayout, computeLayout };
}
