import type { ShallowRef } from 'vue';
import type { SciFlow } from '@sci-flow/core';

/** Helper/alignment lines for Vue. */
export function useHelperLines(engine: ShallowRef<SciFlow | null>) {
  const computeHelperLines = (dragNodeId: string, x: number, y: number) =>
    engine.value?.plugins.helperLines.computeHelperLines(dragNodeId, x, y)
      ?? { snapX: x, snapY: y, lines: [] };
  const getActiveLines = () => engine.value?.plugins.helperLines.getActiveLines() ?? [];
  const clearLines = () => engine.value?.plugins.helperLines.clearLines();
  return { computeHelperLines, getActiveLines, clearLines };
}
