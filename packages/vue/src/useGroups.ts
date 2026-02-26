import type { ShallowRef } from 'vue';
import type { SciFlow } from '@sci-flow/core';

/** Node grouping controls for Vue. */
export function useGroups(engine: ShallowRef<SciFlow | null>) {
  const createGroup = (label: string, nodeIds: string[], color?: string) =>
    engine.value?.plugins.groups.createGroup(label, nodeIds, color) ?? null;
  const deleteGroup = (groupId: string) => engine.value?.plugins.groups.deleteGroup(groupId);
  const moveGroup = (groupId: string, dx: number, dy: number) =>
    engine.value?.plugins.groups.moveGroup(groupId, dx, dy);
  const toggleCollapse = (groupId: string) => engine.value?.plugins.groups.toggleCollapse(groupId);
  const getGroupBounds = (groupId: string) =>
    engine.value?.plugins.groups.getGroupBounds(groupId) ?? null;
  const getAllGroups = () => engine.value?.plugins.groups.getAllGroups() ?? [];
  return { createGroup, deleteGroup, moveGroup, toggleCollapse, getGroupBounds, getAllGroups };
}
