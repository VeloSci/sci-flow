import { useCallback } from 'react';
import type { SciFlow } from '@sci-flow/core';

/** Performance monitor controls. */
export function usePerfMonitor(engine: SciFlow | null) {
  const show = useCallback(() => { engine?.plugins.perfMonitor.show(); }, [engine]);
  const hide = useCallback(() => { engine?.plugins.perfMonitor.hide(); }, [engine]);
  const toggle = useCallback(() => { engine?.plugins.perfMonitor.toggle(); }, [engine]);

  const getFPS = useCallback(() => {
    return engine?.plugins.perfMonitor.getFPS() ?? 0;
  }, [engine]);

  const isVisible = useCallback(() => {
    return engine?.plugins.perfMonitor.isVisible() ?? false;
  }, [engine]);

  return { show, hide, toggle, getFPS, isVisible };
}
