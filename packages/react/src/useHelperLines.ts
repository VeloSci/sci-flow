import { useCallback } from 'react';
import type { SciFlow } from '@sci-flow/core';

/** Helper/alignment lines controls. */
export function useHelperLines(engine: SciFlow | null) {
  const computeHelperLines = useCallback((dragNodeId: string, x: number, y: number) => {
    return engine?.plugins.helperLines.computeHelperLines(dragNodeId, x, y)
      ?? { snapX: x, snapY: y, lines: [] };
  }, [engine]);

  const getActiveLines = useCallback(() => {
    return engine?.plugins.helperLines.getActiveLines() ?? [];
  }, [engine]);

  const clearLines = useCallback(() => {
    engine?.plugins.helperLines.clearLines();
  }, [engine]);

  return { computeHelperLines, getActiveLines, clearLines };
}
