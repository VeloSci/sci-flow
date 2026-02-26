import type { ShallowRef } from 'vue';
import type { SciFlow } from '@sci-flow/core';

/** Snap-to-grid controls for Vue. */
export function useSnap(engine: ShallowRef<SciFlow | null>) {
  const snapNode = (nodeId: string) => engine.value?.plugins.snap.snapNode(nodeId);
  const snapAll = () => engine.value?.plugins.snap.snapAll();
  const setGridSize = (size: number) => engine.value?.plugins.snap.setGridSize(size);
  const toggle = () => engine.value?.plugins.snap.toggle();
  const isEnabled = () => engine.value?.plugins.snap.enabled ?? false;
  const getGridSize = () => engine.value?.plugins.snap.gridSize ?? 20;
  return { snapNode, snapAll, setGridSize, toggle, isEnabled, getGridSize };
}
