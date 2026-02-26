import { useCallback } from 'react';
import type { SciFlow, Edge, ReconnectSide } from '@sci-flow/core';

/** Edge reconnection controls. */
export function useEdgeReconnect(engine: SciFlow | null) {
  const startReconnect = useCallback((edgeId: string, side: ReconnectSide) => {
    engine?.plugins.reconnect.startReconnect(edgeId, side);
  }, [engine]);

  const completeReconnect = useCallback((newNodeId: string, newPortId: string) => {
    return engine?.plugins.reconnect.completeReconnect(newNodeId, newPortId) ?? false;
  }, [engine]);

  const cancel = useCallback(() => {
    engine?.plugins.reconnect.cancel();
  }, [engine]);

  const setValidator = useCallback((fn: (edge: Edge, nodeId: string, portId: string) => boolean) => {
    engine?.plugins.reconnect.setValidator(fn);
  }, [engine]);

  const isReconnecting = useCallback(() => {
    return engine?.plugins.reconnect.isReconnecting() ?? false;
  }, [engine]);

  return { startReconnect, completeReconnect, cancel, setValidator, isReconnecting };
}
