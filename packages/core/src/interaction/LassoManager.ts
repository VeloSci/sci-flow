import { StateManager } from '../state/StateManager';
import { Position, ViewportState } from '../types';

/** Freeform lasso selection tool for selecting nodes by drawing a path. */
export class LassoManager {
    private isDrawing = false;
    private points: Position[] = [];
    private pathEl: SVGPathElement | null = null;
    private svgOverlay: SVGSVGElement | null = null;

    constructor(
        private container: HTMLElement,
        private stateManager: StateManager
    ) {}

    public startLasso(screenPos: Position) {
        this.isDrawing = true;
        this.points = [screenPos];
        this.createOverlay();
    }

    public updateLasso(screenPos: Position) {
        if (!this.isDrawing) return;
        this.points.push(screenPos);
        this.renderPath();
    }

    public endLasso(viewport: ViewportState) {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        if (this.points.length < 3) { this.cleanup(); return; }

        // Convert screen points to flow coordinates
        const rect = this.container.getBoundingClientRect();
        const flowPoints = this.points.map(p => ({
            x: (p.x - rect.left - viewport.x) / viewport.zoom,
            y: (p.y - rect.top - viewport.y) / viewport.zoom
        }));

        // Find nodes inside lasso polygon
        const nodeIds: string[] = [];
        const state = this.stateManager.getState();
        state.nodes.forEach((node) => {
            const cx = node.position.x + (node.style?.width || 200) / 2;
            const cy = node.position.y + (node.style?.height || 150) / 2;
            if (this.pointInPolygon({ x: cx, y: cy }, flowPoints)) {
                nodeIds.push(node.id);
            }
        });

        if (nodeIds.length > 0) {
            this.stateManager.setSelection(nodeIds, []);
        }
        this.cleanup();
    }

    public isActive(): boolean { return this.isDrawing; }

    private pointInPolygon(point: Position, polygon: Position[]): boolean {
        let inside = false;
        const n = polygon.length;
        for (let i = 0, j = n - 1; i < n; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            if ((yi > point.y) !== (yj > point.y) &&
                point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi) {
                inside = !inside;
            }
        }
        return inside;
    }

    private createOverlay() {
        this.svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svgOverlay.style.cssText = `
            position:absolute; top:0; left:0; width:100%; height:100%;
            z-index:9999; pointer-events:none;
        `;
        this.pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.pathEl.setAttribute('fill', 'rgba(0,150,255,0.1)');
        this.pathEl.setAttribute('stroke', 'rgba(0,150,255,0.6)');
        this.pathEl.setAttribute('stroke-width', '1.5');
        this.pathEl.setAttribute('stroke-dasharray', '4 2');
        this.svgOverlay.appendChild(this.pathEl);
        this.container.appendChild(this.svgOverlay);
    }

    private renderPath() {
        if (!this.pathEl || this.points.length < 2) return;
        const rect = this.container.getBoundingClientRect();
        const d = this.points.map((p, i) => {
            const x = p.x - rect.left;
            const y = p.y - rect.top;
            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
        }).join(' ') + ' Z';
        this.pathEl.setAttribute('d', d);
    }

    private cleanup() {
        this.svgOverlay?.remove();
        this.svgOverlay = null;
        this.pathEl = null;
        this.points = [];
    }
}
