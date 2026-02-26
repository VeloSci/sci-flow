import { StateManager } from '../state/StateManager';

export interface Snapshot {
    id: string;
    name: string;
    timestamp: number;
    data: string;  // serialized JSON
}

/** Versioned state snapshots with diff capabilities. */
export class SnapshotManager {
    private snapshots = new Map<string, Snapshot>();

    constructor(private stateManager: StateManager) {}

    /** Create a named snapshot of the current state. */
    public createSnapshot(name: string): Snapshot {
        const id = `snap-${Date.now()}`;
        const data = JSON.stringify({
            nodes: [...this.stateManager.getState().nodes.entries()],
            edges: [...this.stateManager.getState().edges.entries()],
            viewport: this.stateManager.getState().viewport,
        });
        const snapshot: Snapshot = { id, name, timestamp: Date.now(), data };
        this.snapshots.set(id, snapshot);
        return snapshot;
    }

    /** Restore a snapshot by ID. */
    public restoreSnapshot(snapshotId: string): boolean {
        const snap = this.snapshots.get(snapshotId);
        if (!snap) return false;
        const parsed = JSON.parse(snap.data);
        const state = this.stateManager.getState();
        state.nodes.clear();
        state.edges.clear();
        for (const [k, v] of parsed.nodes) state.nodes.set(k, v);
        for (const [k, v] of parsed.edges) state.edges.set(k, v);
        Object.assign(state.viewport, parsed.viewport);
        return true;
    }

    /** Diff two snapshots (returns added/removed/modified node IDs). */
    public diff(idA: string, idB: string): { added: string[]; removed: string[]; modified: string[] } {
        const a = this.snapshots.get(idA);
        const b = this.snapshots.get(idB);
        if (!a || !b) return { added: [], removed: [], modified: [] };
        const nodesA = new Map<string, string>(JSON.parse(a.data).nodes.map(
            ([k, v]: [string, unknown]) => [k, JSON.stringify(v)]
        ));
        const nodesB = new Map<string, string>(JSON.parse(b.data).nodes.map(
            ([k, v]: [string, unknown]) => [k, JSON.stringify(v)]
        ));
        const added: string[] = []; const removed: string[] = []; const modified: string[] = [];
        nodesB.forEach((val, key) => {
            if (!nodesA.has(key)) added.push(key);
            else if (nodesA.get(key) !== val) modified.push(key);
        });
        nodesA.forEach((_, key) => { if (!nodesB.has(key)) removed.push(key); });
        return { added, removed, modified };
    }

    public listSnapshots(): Snapshot[] { return [...this.snapshots.values()]; }
    public deleteSnapshot(id: string) { this.snapshots.delete(id); }
}
