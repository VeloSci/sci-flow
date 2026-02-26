import { StateManager } from '../state/StateManager';
import { Position } from '../types';

/** Manages multi-touch gestures: pinch-to-zoom, two-finger pan, tap-to-connect, double-tap fitView. */
export class TouchManager {
    private activePointers = new Map<number, Position>();
    private lastPinchDistance = 0;
    private lastPinchCenter: Position = { x: 0, y: 0 };
    private isTouchDevice = false;
    private tapSourcePort: { nodeId: string; portId: string } | null = null;
    private lastTapTime = 0;
    private onDoubleTap: (() => void) | null = null;
    private onTapConnect: ((source: { nodeId: string; portId: string }, target: { nodeId: string; portId: string }) => void) | null = null;

    constructor(
        private container: HTMLElement,
        private stateManager: StateManager
    ) {
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (this.isTouchDevice) {
            this.container.setAttribute('data-touch-device', 'true');
        }
    }

    public setDoubleTapHandler(fn: () => void) { this.onDoubleTap = fn; }
    public setTapConnectHandler(fn: (s: { nodeId: string; portId: string }, t: { nodeId: string; portId: string }) => void) {
        this.onTapConnect = fn;
    }

    public trackPointer(e: PointerEvent) {
        this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    public releasePointer(e: PointerEvent) {
        this.activePointers.delete(e.pointerId);
        if (this.activePointers.size < 2) {
            this.lastPinchDistance = 0;
        }
    }

    public isMultiTouch(): boolean {
        return this.activePointers.size >= 2;
    }

    public getIsTouchDevice(): boolean { return this.isTouchDevice; }

    /** Returns true if the pinch gesture was handled. */
    public handlePinchZoom(e: PointerEvent): boolean {
        if (this.activePointers.size < 2) return false;
        this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        const pointers = Array.from(this.activePointers.values());
        const p1 = pointers[0];
        const p2 = pointers[1];
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const center: Position = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

        if (this.lastPinchDistance > 0) {
            const scale = dist / this.lastPinchDistance;
            const state = this.stateManager.getState();
            const { x, y, zoom } = state.viewport;
            const newZoom = Math.min(Math.max(zoom * scale, 0.1), 5);

            const rect = this.container.getBoundingClientRect();
            const cx = center.x - rect.left;
            const cy = center.y - rect.top;
            const worldX = (cx - x) / zoom;
            const worldY = (cy - y) / zoom;
            const newX = cx - worldX * newZoom;
            const newY = cy - worldY * newZoom;

            // Also apply pan delta from center movement
            const panDx = center.x - this.lastPinchCenter.x;
            const panDy = center.y - this.lastPinchCenter.y;

            this.stateManager.setViewport({
                x: newX + panDx,
                y: newY + panDy,
                zoom: newZoom
            });
        }

        this.lastPinchDistance = dist;
        this.lastPinchCenter = center;
        return true;
    }

    /** Handle tap-to-connect: tap a port to stage source, tap another to complete. */
    public handlePortTap(nodeId: string, portId: string): boolean {
        if (!this.isTouchDevice) return false;

        if (!this.tapSourcePort) {
            this.tapSourcePort = { nodeId, portId };
            // Highlight source port
            const port = this.container.querySelector(
                `.sci-flow-port[data-nodeid="${nodeId}"][data-portid="${portId}"]`
            );
            port?.classList.add('sci-flow-port-source-staged');
            return true;
        }

        // Second tap — complete connection
        const target = { nodeId, portId };
        if (this.onTapConnect && target.nodeId !== this.tapSourcePort.nodeId) {
            this.onTapConnect(this.tapSourcePort, target);
        }
        this.clearStagedPort();
        return true;
    }

    public clearStagedPort() {
        this.container.querySelectorAll('.sci-flow-port-source-staged')
            .forEach(p => p.classList.remove('sci-flow-port-source-staged'));
        this.tapSourcePort = null;
    }

    /** Detect double-tap for fitView */
    public handleTap(_e: PointerEvent): boolean {
        if (!this.isTouchDevice) return false;
        const now = Date.now();
        if (now - this.lastTapTime < 300) {
            this.onDoubleTap?.();
            this.lastTapTime = 0;
            return true;
        }
        this.lastTapTime = now;
        return false;
    }

    /** Long-press detection for context menu */
    public createLongPressDetector(callback: (e: PointerEvent) => void) {
        let timer: ReturnType<typeof setTimeout> | null = null;
        let startEvent: PointerEvent | null = null;

        return {
            start: (e: PointerEvent) => {
                startEvent = e;
                timer = setTimeout(() => {
                    if (startEvent) callback(startEvent);
                    timer = null;
                }, 500);
            },
            move: () => { if (timer) { clearTimeout(timer); timer = null; } },
            end: () => { if (timer) { clearTimeout(timer); timer = null; } }
        };
    }
}
