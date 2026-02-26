import { useMemo } from 'react';
import type { SciFlow } from '@sci-flow/core';

/**
 * Access all plugin managers from the SciFlow engine.
 * Returns a stable reference to the plugins object.
 */
export function usePlugins(engine: SciFlow | null) {
  return useMemo(() => {
    if (!engine) return null;
    return engine.plugins;
  }, [engine]);
}
