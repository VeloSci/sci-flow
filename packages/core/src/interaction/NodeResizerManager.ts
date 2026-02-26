import { StateManager } from '../state/StateManager';
import { Position } from '../types';

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface ResizeOptions {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    keepAspectRatio?: boolean;
}

const DEFAULT_OPTS: Required<ResizeOptions> = {
    minWidth: 80, minHeight: 60, maxWidth: 2000, maxHeight: 2000, keepAspectRatio: false
};

/** Manages node resizing via drag handles on node corners/edges. */
export class NodeResizerManager {
    private resizingNodeId: string | null = null;
    private resizeDir: ResizeDirection | null = null;
    private startPos: Position | null = null;
    private startBounds = { x: 0, y: 0, w: 0, h: 0 };
    private opts: Required<ResizeOptions>;

    constructor(private stateManager: StateManager, options?: ResizeOptions) {
        this.opts = { ...DEFAULT_OPTS, ...options };
    }

    public startResize(nodeId: string, dir: ResizeDirection, flowPos: Position) {
        const node = this.stateManager.getState().nodes.get(nodeId);
        if (!node) return;
        this.resizingNodeId = nodeId;
        this.resizeDir = dir;
        this.startPos = flowPos;
        this.startBounds = {
            x: node.position.x, y: node.position.y,
            w: node.style?.width || 200, h: node.style?.height || 150
        };
    }

    public updateResize(flowPos: Position) {
        if (!this.resizingNodeId || !this.startPos || !this.resizeDir) return;
        const node = this.stateManager.getState().nodes.get(this.resizingNodeId);
        if (!node) return;

        const dx = flowPos.x - this.startPos.x;
        const dy = flowPos.y - this.startPos.y;
        let { x, y, w, h } = this.startBounds;

        if (this.resizeDir.includes('e')) w += dx;
        if (this.resizeDir.includes('w')) { x += dx; w -= dx; }
        if (this.resizeDir.includes('s')) h += dy;
        if (this.resizeDir.includes('n')) { y += dy; h -= dy; }

        // Clamp
        w = Math.max(this.opts.minWidth, Math.min(this.opts.maxWidth, w));
        h = Math.max(this.opts.minHeight, Math.min(this.opts.maxHeight, h));

        if (this.opts.keepAspectRatio) {
            const ratio = this.startBounds.w / this.startBounds.h;
            h = w / ratio;
        }

        node.position = { x, y };
        node.style = { ...node.style, width: w, height: h };
        this.stateManager.forceUpdate();
    }

    public endResize() {
        if (this.resizingNodeId) {
            this.stateManager.saveSnapshot();
        }
        this.resizingNodeId = null;
        this.resizeDir = null;
        this.startPos = null;
    }

    public isResizing(): boolean { return !!this.resizingNodeId; }
}
