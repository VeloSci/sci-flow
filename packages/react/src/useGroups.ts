import { useCallback } from 'react';
import type { SciFlow } from '@sci-flow/core';

/** Node grouping controls. */
export function useGroups(engine: SciFlow | null) {
  const createGroup = useCallback((label: string, nodeIds: string[], color?: string) => {
    return engine?.plugins.groups.createGroup(label, nodeIds, color) ?? null;
  }, [engine]);

  const deleteGroup = useCallback((groupId: string) => {
    engine?.plugins.groups.deleteGroup(groupId);
  }, [engine]);

  const moveGroup = useCallback((groupId: string, dx: number, dy: number) => {
    engine?.plugins.groups.moveGroup(groupId, dx, dy);
  }, [engine]);

  const toggleCollapse = useCallback((groupId: string) => {
    engine?.plugins.groups.toggleCollapse(groupId);
  }, [engine]);

  const getGroupBounds = useCallback((groupId: string) => {
    return engine?.plugins.groups.getGroupBounds(groupId) ?? null;
  }, [engine]);

  const getAllGroups = useCallback(() => {
    return engine?.plugins.groups.getAllGroups() ?? [];
  }, [engine]);

  return { createGroup, deleteGroup, moveGroup, toggleCollapse, getGroupBounds, getAllGroups };
}
