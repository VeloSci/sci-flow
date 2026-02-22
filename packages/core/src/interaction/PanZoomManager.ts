import { StateManager } from '../state/StateManager';

export class PanZoomManager {
    constructor(private stateManager: StateManager) {}

    public handleWheel(e: WheelEvent): void {
        e.preventDefault();
        const state = this.stateManager.getState();
        const { x, y, zoom } = state.viewport;

        const zoomSpeed = 0.001;
        const deltaZoom = -e.deltaY * zoomSpeed;
        const newZoom = Math.min(Math.max(zoom + deltaZoom, 0.1), 5);

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldX = (mouseX - x) / zoom;
        const worldY = (mouseY - y) / zoom;

        const newX = mouseX - worldX * newZoom;
        const newY = mouseY - worldY * newZoom;

        this.stateManager.setViewport({ x: newX, y: newY, zoom: newZoom });
    }

    public handlePan(e: PointerEvent, lastPos: { x: number, y: number }): { x: number, y: number } {
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;
        const state = this.stateManager.getState();
        
        this.stateManager.setViewport({
            ...state.viewport,
            x: state.viewport.x + dx,
            y: state.viewport.y + dy
        });

        return { x: e.clientX, y: e.clientY };
    }
}
