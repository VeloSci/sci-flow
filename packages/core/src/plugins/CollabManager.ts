import type { Position } from '../types';

export interface CRDTOperation {
    type: 'add_node' | 'remove_node' | 'move_node' | 'add_edge' | 'remove_edge' | 'update_data';
    nodeId?: string;
    edgeId?: string;
    data?: Record<string, unknown>;
    position?: Position;
    timestamp: number;
    userId: string;
}

export interface UserPresence {
    userId: string;
    cursor: Position;
    color: string;
    name: string;
    lastSeen: number;
}

/** Collaborative editing manager — CRDT operation interface. */
export class CollabManager {
    private presences = new Map<string, UserPresence>();
    private operationLog: CRDTOperation[] = [];
    private onRemoteOp?: (op: CRDTOperation) => void;
    private onPresenceChange?: (presences: UserPresence[]) => void;

    /** Register handler for remote operations. */
    public onOperation(handler: (op: CRDTOperation) => void) {
        this.onRemoteOp = handler;
    }

    /** Register handler for presence changes. */
    public onPresence(handler: (presences: UserPresence[]) => void) {
        this.onPresenceChange = handler;
    }

    /** Create a local operation and broadcast it. */
    public emitOperation(op: Omit<CRDTOperation, 'timestamp'>) {
        const fullOp: CRDTOperation = { ...op, timestamp: Date.now() };
        this.operationLog.push(fullOp);
        // In a real impl, this would broadcast to other clients
    }

    /** Apply a remote operation (called by the network layer). */
    public applyRemoteOperation(op: CRDTOperation) {
        this.operationLog.push(op);
        this.onRemoteOp?.(op);
    }

    /** Update own cursor presence. */
    public updatePresence(userId: string, cursor: Position, name: string, color: string) {
        this.presences.set(userId, { userId, cursor, color, name, lastSeen: Date.now() });
        this.onPresenceChange?.([...this.presences.values()]);
    }

    /** Remove stale presences (>30s). */
    public cleanStalePresences() {
        const cutoff = Date.now() - 30_000;
        for (const [id, p] of this.presences) {
            if (p.lastSeen < cutoff) this.presences.delete(id);
        }
    }

    public getPresences(): UserPresence[] { return [...this.presences.values()]; }
    public getOperationLog(): CRDTOperation[] { return [...this.operationLog]; }
}
