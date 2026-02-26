import { useCallback } from 'react';
import type { SciFlow, Snapshot } from '@sci-flow/core';

/** Versioned snapshots controls. */
export function useSnapshots(engine: SciFlow | null) {
  const createSnapshot = useCallback((name: string) => {
    return engine?.plugins.snapshots.createSnapshot(name) ?? null;
  }, [engine]);

  const restoreSnapshot = useCallback((id: string) => {
    return engine?.plugins.snapshots.restoreSnapshot(id) ?? false;
  }, [engine]);

  const diff = useCallback((idA: string, idB: string) => {
    return engine?.plugins.snapshots.diff(idA, idB) ?? { added: [], removed: [], modified: [] };
  }, [engine]);

  const listSnapshots = useCallback((): Snapshot[] => {
    return engine?.plugins.snapshots.listSnapshots() ?? [];
  }, [engine]);

  const deleteSnapshot = useCallback((id: string) => {
    engine?.plugins.snapshots.deleteSnapshot(id);
  }, [engine]);

  return { createSnapshot, restoreSnapshot, diff, listSnapshots, deleteSnapshot };
}
