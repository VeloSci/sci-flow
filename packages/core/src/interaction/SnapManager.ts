import { StateManager } from '../state/StateManager';

export interface SnapOptions {
    gridSize: number;
    enabled: boolean;
}

/** Snap-to-grid manager: snaps node positions to a configurable grid. */
export class SnapManager {
    public gridSize = 20;
    public enabled = true;

    constructor(private stateManager: StateManager, options?: Partial<SnapOptions>) {
        if (options?.gridSize) this.gridSize = options.gridSize;
        if (options?.enabled !== undefined) this.enabled = options.enabled;
    }

    /** Snap a value to the nearest grid unit. */
    public snap(value: number): number {
        if (!this.enabled) return value;
        return Math.round(value / this.gridSize) * this.gridSize;
    }

    /** Snap a position { x, y } to the grid. */
    public snapPosition(pos: { x: number; y: number }): { x: number; y: number } {
        return { x: this.snap(pos.x), y: this.snap(pos.y) };
    }

    /** Apply snap to a node by ID (mutates state). */
    public snapNode(nodeId: string) {
        const state = this.stateManager.getState();
        const node = state.nodes.get(nodeId);
        if (!node) return;
        node.position = this.snapPosition(node.position);
    }

    /** Apply snap to all nodes. */
    public snapAll() {
        const state = this.stateManager.getState();
        state.nodes.forEach(node => {
            node.position = this.snapPosition(node.position);
        });
    }

    public setGridSize(size: number) { this.gridSize = size; }
    public toggle() { this.enabled = !this.enabled; }
}
