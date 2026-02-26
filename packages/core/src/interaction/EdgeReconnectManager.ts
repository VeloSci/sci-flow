import { StateManager } from '../state/StateManager';
import type { Edge } from '../types';

export type ReconnectSide = 'source' | 'target';

/** Manages dragging existing edge endpoints to reconnect to different ports. */
export class EdgeReconnectManager {
    private activeEdge: Edge | null = null;
    private activeSide: ReconnectSide | null = null;
    private onValidate?: (edge: Edge, newNodeId: string, newPortId: string) => boolean;

    constructor(private stateManager: StateManager) {}

    /** Set a validation callback for reconnection attempts. */
    public setValidator(fn: (edge: Edge, newNodeId: string, newPortId: string) => boolean) {
        this.onValidate = fn;
    }

    /** Start reconnecting an edge from the given side. */
    public startReconnect(edgeId: string, side: ReconnectSide) {
        const state = this.stateManager.getState();
        const edge = state.edges.get(edgeId);
        if (!edge) return;
        this.activeEdge = { ...edge };
        this.activeSide = side;
    }

    /** Complete the reconnection to a new port. */
    public completeReconnect(newNodeId: string, newPortId: string): boolean {
        if (!this.activeEdge || !this.activeSide) return false;
        const state = this.stateManager.getState();
        const edge = state.edges.get(this.activeEdge.id);
        if (!edge) { this.cancel(); return false; }

        // Validate
        if (this.onValidate && !this.onValidate(edge, newNodeId, newPortId)) {
            this.cancel();
            return false;
        }

        // Apply
        if (this.activeSide === 'source') {
            edge.source = newNodeId;
            edge.sourceHandle = newPortId;
        } else {
            edge.target = newNodeId;
            edge.targetHandle = newPortId;
        }

        this.activeEdge = null;
        this.activeSide = null;
        return true;
    }

    /** Cancel the reconnection, restoring original state. */
    public cancel() {
        this.activeEdge = null;
        this.activeSide = null;
    }

    public isReconnecting(): boolean { return this.activeEdge !== null; }
    public getActiveEdge(): Edge | null { return this.activeEdge; }
    public getActiveSide(): ReconnectSide | null { return this.activeSide; }
}
