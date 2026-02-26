import { ref, watch } from 'vue';
import type { ShallowRef } from 'vue';
import type { SciFlow } from '@sci-flow/core';
import type { ToolbarAction } from '@sci-flow/core';

/**
 * Node toolbar composable for Vue — shows floating toolbar on selected nodes.
 */
export function useNodeToolbar(engine: ShallowRef<SciFlow | null>, actions: ToolbarAction[]) {
  const activeNodeId = ref<string | null>(null);

  watch(engine, (eng) => {
    if (eng) eng.plugins.toolbar.setActions(actions);
  }, { immediate: true });

  const show = (nodeId: string) => {
    engine.value?.plugins.toolbar.show(nodeId);
    activeNodeId.value = nodeId;
  };

  const hide = () => {
    engine.value?.plugins.toolbar.hide();
    activeNodeId.value = null;
  };

  return { show, hide, activeNodeId };
}
