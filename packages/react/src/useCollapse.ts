import { useCallback } from 'react';
import type { SciFlow } from '@sci-flow/core';

/**
 * Expand/collapse subtree helpers for hierarchical node graphs.
 */
export function useCollapse(engine: SciFlow | null) {
  const toggle = useCallback((nodeId: string) => {
    engine?.plugins.collapse.toggle(nodeId);
  }, [engine]);

  const collapse = useCallback((nodeId: string) => {
    engine?.plugins.collapse.collapse(nodeId);
  }, [engine]);

  const expand = useCallback((nodeId: string) => {
    engine?.plugins.collapse.expand(nodeId);
  }, [engine]);

  const isCollapsed = useCallback((nodeId: string) => {
    return engine?.plugins.collapse.isCollapsed(nodeId) ?? false;
  }, [engine]);

  const isHidden = useCallback((nodeId: string) => {
    return engine?.plugins.collapse.isHidden(nodeId) ?? false;
  }, [engine]);

  return { toggle, collapse, expand, isCollapsed, isHidden };
}
