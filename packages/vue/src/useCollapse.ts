import type { ShallowRef } from 'vue';
import type { SciFlow } from '@sci-flow/core';

/**
 * Expand/collapse subtree composable for Vue.
 */
export function useCollapse(engine: ShallowRef<SciFlow | null>) {
  const toggle = (nodeId: string) => engine.value?.plugins.collapse.toggle(nodeId);
  const collapse = (nodeId: string) => engine.value?.plugins.collapse.collapse(nodeId);
  const expand = (nodeId: string) => engine.value?.plugins.collapse.expand(nodeId);
  const isCollapsed = (nodeId: string) => engine.value?.plugins.collapse.isCollapsed(nodeId) ?? false;
  const isHidden = (nodeId: string) => engine.value?.plugins.collapse.isHidden(nodeId) ?? false;

  return { toggle, collapse, expand, isCollapsed, isHidden };
}
