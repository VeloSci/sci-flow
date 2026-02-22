import { StateManager } from '../state/StateManager';
import { Position, FlowState } from '../types';

type Viewport = FlowState['viewport'];

export class SelectionManager {
    private selectionBoxEl: HTMLDivElement | null = null;
    private selectionStart: Position | null = null;

    constructor(
        private container: HTMLElement,
        private stateManager: StateManager
    ) {}

    public startSelection(pos: Position): void {
        this.selectionStart = pos;
        this.selectionBoxEl = document.createElement('div');
        this.selectionBoxEl.style.position = 'absolute';
        this.selectionBoxEl.style.border = '1px solid var(--sf-edge-active, #00f2ff)';
        this.selectionBoxEl.style.backgroundColor = 'rgba(0, 242, 255, 0.1)';
        this.selectionBoxEl.style.pointerEvents = 'none';
        this.selectionBoxEl.style.zIndex = '1000';
        this.container.appendChild(this.selectionBoxEl);
    }

    public updateSelection(currentPos: Position, viewport: Viewport): void {
        if (!this.selectionStart || !this.selectionBoxEl) return;

        const left = Math.min(this.selectionStart.x, currentPos.x);
        const top = Math.min(this.selectionStart.y, currentPos.y);
        const width = Math.abs(this.selectionStart.x - currentPos.x);
        const height = Math.abs(this.selectionStart.y - currentPos.y);

        this.selectionBoxEl.style.left = `${left}px`;
        this.selectionBoxEl.style.top = `${top}px`;
        this.selectionBoxEl.style.width = `${width}px`;
        this.selectionBoxEl.style.height = `${height}px`;

        // Select items within the box
        const rect = this.container.getBoundingClientRect();
        const flowStart = this.screenToFlow(this.selectionStart, viewport, rect);
        const flowEnd = this.screenToFlow(currentPos, viewport, rect);

        const flowLeft = Math.min(flowStart.x, flowEnd.x);
        const flowTop = Math.min(flowStart.y, flowEnd.y);
        const flowRight = Math.max(flowStart.x, flowEnd.x);
        const flowBottom = Math.max(flowStart.y, flowEnd.y);

        this.performSelection(flowLeft, flowTop, flowRight, flowBottom);
    }

    public endSelection(): void {
        if (this.selectionBoxEl) {
            this.selectionBoxEl.remove();
            this.selectionBoxEl = null;
        }
        this.selectionStart = null;
    }

    private performSelection(left: number, top: number, right: number, bottom: number): void {
        const state = this.stateManager.getState();
        const selectedNodeIds: string[] = [];
        const selectedEdgeIds: string[] = [];

        state.nodes.forEach(node => {
            const nw = node.style?.width || 200;
            const nh = node.style?.height || 150;
            if (node.position.x >= left && node.position.x + nw <= right &&
                node.position.y >= top && node.position.y + nh <= bottom) {
                selectedNodeIds.push(node.id);
            }
        });

        // Simple edge selection: both endpoints must be in box
        state.edges.forEach(edge => {
            const sNode = state.nodes.get(edge.source);
            const tNode = state.nodes.get(edge.target);
            if (sNode && tNode) {
                if (sNode.position.x >= left && sNode.position.x <= right &&
                    sNode.position.y >= top && sNode.position.y <= bottom &&
                    tNode.position.x >= left && tNode.position.x <= right &&
                    tNode.position.y >= top && tNode.position.y <= bottom) {
                    selectedEdgeIds.push(edge.id);
                }
            }
        });

        this.stateManager.setSelection(selectedNodeIds, selectedEdgeIds);
    }

    private screenToFlow(pos: Position, viewport: Viewport, rect: DOMRect): Position {
        return {
            x: (pos.x - rect.left - viewport.x) / viewport.zoom,
            y: (pos.y - rect.top - viewport.y) / viewport.zoom
        };
    }
}
