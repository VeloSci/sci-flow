import type { ShallowRef } from 'vue';
import type { SciFlow, Edge, ReconnectSide } from '@sci-flow/core';

/** Edge reconnection for Vue. */
export function useEdgeReconnect(engine: ShallowRef<SciFlow | null>) {
  const startReconnect = (edgeId: string, side: ReconnectSide) =>
    engine.value?.plugins.reconnect.startReconnect(edgeId, side);
  const completeReconnect = (newNodeId: string, newPortId: string) =>
    engine.value?.plugins.reconnect.completeReconnect(newNodeId, newPortId) ?? false;
  const cancel = () => engine.value?.plugins.reconnect.cancel();
  const setValidator = (fn: (edge: Edge, nodeId: string, portId: string) => boolean) =>
    engine.value?.plugins.reconnect.setValidator(fn);
  const isReconnecting = () => engine.value?.plugins.reconnect.isReconnecting() ?? false;
  return { startReconnect, completeReconnect, cancel, setValidator, isReconnecting };
}
