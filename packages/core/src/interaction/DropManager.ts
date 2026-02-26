import { StateManager } from '../state/StateManager';
import { Position, ViewportState, Node, JsonMap, DataType } from '../types';

export interface DropNodeData {
    type: string;
    title?: string;
    inputs?: Record<string, { dataType: DataType; label?: string }>;
    outputs?: Record<string, { dataType: DataType; label?: string }>;
    data?: JsonMap;
}

/** Manages drag-and-drop of new nodes from external panels onto the canvas. */
export class DropManager {
    private onDropCallback: ((position: Position, data: DropNodeData) => void) | null = null;

    constructor(
        private container: HTMLElement,
        private stateManager: StateManager
    ) {
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.container.addEventListener('dragover', this.handleDragOver);
        this.container.addEventListener('drop', this.handleDrop);
    }

    public setOnDrop(callback: (position: Position, data: DropNodeData) => void) {
        this.onDropCallback = callback;
    }

    private handleDragOver(e: DragEvent) {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    }

    private handleDrop(e: DragEvent) {
        e.preventDefault();
        const raw = e.dataTransfer?.getData('application/sci-flow-node');
        if (!raw) return;

        try {
            const data: DropNodeData = JSON.parse(raw);
            const state = this.stateManager.getState();
            const rect = this.container.getBoundingClientRect();
            const position = this.screenToFlow(
                { x: e.clientX, y: e.clientY },
                state.viewport, rect
            );

            if (this.onDropCallback) {
                this.onDropCallback(position, data);
            } else {
                this.createDefaultNode(position, data);
            }
        } catch { /* invalid data, ignore */ }
    }

    private createDefaultNode(position: Position, data: DropNodeData) {
        const inputs: Record<string, { id: string; type: 'input'; dataType: DataType; label?: string }> = {};
        const outputs: Record<string, { id: string; type: 'output'; dataType: DataType; label?: string }> = {};

        if (data.inputs) {
            Object.entries(data.inputs).forEach(([key, val]) => {
                inputs[key] = { id: key, type: 'input', dataType: val.dataType, label: val.label };
            });
        }
        if (data.outputs) {
            Object.entries(data.outputs).forEach(([key, val]) => {
                outputs[key] = { id: key, type: 'output', dataType: val.dataType, label: val.label };
            });
        }

        const node: Node = {
            id: `node-${Date.now()}`,
            type: data.type,
            position,
            data: data.data || { title: data.title || data.type },
            inputs,
            outputs,
            style: { width: 160, height: 100 }
        };
        this.stateManager.addNode(node);
    }

    private screenToFlow(pos: Position, viewport: ViewportState, rect: DOMRect): Position {
        return {
            x: (pos.x - rect.left - viewport.x) / viewport.zoom,
            y: (pos.y - rect.top - viewport.y) / viewport.zoom
        };
    }

    public destroy() {
        this.container.removeEventListener('dragover', this.handleDragOver);
        this.container.removeEventListener('drop', this.handleDrop);
    }
}
