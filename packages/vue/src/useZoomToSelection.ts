import type { ShallowRef } from 'vue';
import type { SciFlow } from '@sci-flow/core';

/** Zoom-to-selection for Vue. */
export function useZoomToSelection(engine: ShallowRef<SciFlow | null>) {
  const zoomToSelection = (nodeIds: string[], padding = 50) =>
    engine.value?.plugins.zoomToSelection.zoomToSelection(nodeIds, padding) ?? null;
  const zoomToSelected = () =>
    engine.value?.plugins.zoomToSelection.zoomToSelected() ?? null;
  return { zoomToSelection, zoomToSelected };
}
