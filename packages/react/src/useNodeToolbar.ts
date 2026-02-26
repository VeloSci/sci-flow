import { useCallback, useEffect, useState } from 'react';
import type { SciFlow } from '@sci-flow/core';
import type { ToolbarAction } from '@sci-flow/core';

/**
 * Node toolbar hook — shows a floating toolbar when a node is selected.
 */
export function useNodeToolbar(engine: SciFlow | null, actions: ToolbarAction[]) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!engine) return;
    engine.plugins.toolbar.setActions(actions);
  }, [engine, actions]);

  const show = useCallback((nodeId: string) => {
    engine?.plugins.toolbar.show(nodeId);
    setActiveNodeId(nodeId);
  }, [engine]);

  const hide = useCallback(() => {
    engine?.plugins.toolbar.hide();
    setActiveNodeId(null);
  }, [engine]);

  return { show, hide, activeNodeId };
}
