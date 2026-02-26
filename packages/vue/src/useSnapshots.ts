import type { ShallowRef } from 'vue';
import type { SciFlow, Snapshot } from '@sci-flow/core';

/** Versioned snapshots for Vue. */
export function useSnapshots(engine: ShallowRef<SciFlow | null>) {
  const createSnapshot = (name: string) =>
    engine.value?.plugins.snapshots.createSnapshot(name) ?? null;
  const restoreSnapshot = (id: string) =>
    engine.value?.plugins.snapshots.restoreSnapshot(id) ?? false;
  const diff = (idA: string, idB: string) =>
    engine.value?.plugins.snapshots.diff(idA, idB) ?? { added: [], removed: [], modified: [] };
  const listSnapshots = (): Snapshot[] =>
    engine.value?.plugins.snapshots.listSnapshots() ?? [];
  const deleteSnapshot = (id: string) => engine.value?.plugins.snapshots.deleteSnapshot(id);
  return { createSnapshot, restoreSnapshot, diff, listSnapshots, deleteSnapshot };
}
