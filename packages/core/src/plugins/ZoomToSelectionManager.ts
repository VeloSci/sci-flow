import { StateManager } from '../state/StateManager';

/** Zoom viewport to fit a specific set of selected nodes. */
export class ZoomToSelectionManager {
    constructor(
        private stateManager: StateManager,
        private container: HTMLElement
    ) {}

    /** Zoom to fit the given nodeIds with padding. */
    public zoomToSelection(nodeIds: string[], padding = 50): { x: number; y: number; zoom: number } | null {
        const state = this.stateManager.getState();
        if (nodeIds.length === 0) return null;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const id of nodeIds) {
            const node = state.nodes.get(id);
            if (!node) continue;
            const w = node.style?.width || 200;
            const h = node.style?.height || 150;
            minX = Math.min(minX, node.position.x);
            minY = Math.min(minY, node.position.y);
            maxX = Math.max(maxX, node.position.x + w);
            maxY = Math.max(maxY, node.position.y + h);
        }

        if (!Number.isFinite(minX)) return null;

        const rect = this.container.getBoundingClientRect();
        const containerWidth = rect.width || 800;
        const containerHeight = rect.height || 600;
        const contentWidth = maxX - minX + padding * 2;
        const contentHeight = maxY - minY + padding * 2;
        const zoom = Math.min(containerWidth / contentWidth, containerHeight / contentHeight, 2);
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;

        return {
            x: containerWidth / 2 - cx * zoom,
            y: containerHeight / 2 - cy * zoom,
            zoom,
        };
    }

    /** Zoom to currently selected nodes. */
    public zoomToSelected(): { x: number; y: number; zoom: number } | null {
        const state = this.stateManager.getState();
        const selected: string[] = [];
        state.nodes.forEach(n => { if (n.selected) selected.push(n.id); });
        if (selected.length === 0) return null;
        return this.zoomToSelection(selected);
    }
}
