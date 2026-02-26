import { useCallback } from 'react';
import type { SciFlow } from '@sci-flow/core';

/** Zoom-to-selection controls. */
export function useZoomToSelection(engine: SciFlow | null) {
  const zoomToSelection = useCallback((nodeIds: string[], padding = 50) => {
    return engine?.plugins.zoomToSelection.zoomToSelection(nodeIds, padding) ?? null;
  }, [engine]);

  const zoomToSelected = useCallback(() => {
    return engine?.plugins.zoomToSelection.zoomToSelected() ?? null;
  }, [engine]);

  return { zoomToSelection, zoomToSelected };
}
