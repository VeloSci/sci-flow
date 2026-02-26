import { useCallback } from 'react';
import type { SciFlow } from '@sci-flow/core';

/** Snap-to-grid controls. */
export function useSnap(engine: SciFlow | null) {
  const snapNode = useCallback((nodeId: string) => {
    engine?.plugins.snap.snapNode(nodeId);
  }, [engine]);

  const snapAll = useCallback(() => {
    engine?.plugins.snap.snapAll();
  }, [engine]);

  const setGridSize = useCallback((size: number) => {
    engine?.plugins.snap.setGridSize(size);
  }, [engine]);

  const toggle = useCallback(() => {
    engine?.plugins.snap.toggle();
  }, [engine]);

  const isEnabled = useCallback(() => {
    return engine?.plugins.snap.enabled ?? false;
  }, [engine]);

  const getGridSize = useCallback(() => {
    return engine?.plugins.snap.gridSize ?? 20;
  }, [engine]);

  return { snapNode, snapAll, setGridSize, toggle, isEnabled, getGridSize };
}
