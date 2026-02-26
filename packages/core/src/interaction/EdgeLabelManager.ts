import { StateManager } from '../state/StateManager';

/** Manages labels and inline UI elements mounted at edge midpoints. */
export class EdgeLabelManager {
    private labelElements = new Map<string, HTMLDivElement>();

    constructor(
        private container: HTMLElement,
        private stateManager: StateManager
    ) {}

    /**
     * Find the midpoint of the rendered SVG path for an edge.
     * Uses getPointAtLength(totalLength/2) on the actual <path> element
     * so labels follow bezier, step, and smart routes correctly.
     * Returns coordinates in FLOW space.
     */
    private getPathMidpoint(edgeId: string): { x: number; y: number } | null {
        const state = this.stateManager.getState();
        // Edge group uses id format: edge-group-{edgeId}
        const group = this.container.querySelector(`#edge-group-${edgeId}`);
        const pathEl = group?.querySelector('.sci-flow-edge-fg') as SVGPathElement | null;

        if (pathEl) {
            try {
                const totalLen = pathEl.getTotalLength();
                if (totalLen > 0) {
                    const mid = pathEl.getPointAtLength(totalLen / 2);
                    // These coordinates are already in flow space (the SVG group
                    // has a transform applied, but getPointAtLength returns
                    // coordinates in the element's own coordinate system)
                    return { x: mid.x, y: mid.y };
                }
            } catch { /* path not rendered yet, use fallback */ }
        }

        // Fallback: straight midpoint between source and target node centers
        const edge = state.edges.get(edgeId);
        if (!edge) return null;
        const src = state.nodes.get(edge.source);
        const tgt = state.nodes.get(edge.target);
        if (!src || !tgt) return null;

        const sw = src.style?.width || 200;
        const sh = src.style?.height || 150;
        const tw = tgt.style?.width || 200;
        const th = tgt.style?.height || 150;

        return {
            x: ((src.position.x + sw / 2) + (tgt.position.x + tw / 2)) / 2,
            y: ((src.position.y + sh / 2) + (tgt.position.y + th / 2)) / 2,
        };
    }

    /** Re-render all edge labels based on current state. */
    public reconcile() {
        const state = this.stateManager.getState();
        const activeIds = new Set<string>();

        state.edges.forEach((edge) => {
            if (!edge.data?.label) return;
            activeIds.add(edge.id);

            const midpoint = this.getPathMidpoint(edge.id);
            if (!midpoint) return;

            // Convert flow coords → screen coords via viewport transform
            const { viewport } = state;
            const sx = midpoint.x * viewport.zoom + viewport.x;
            const sy = midpoint.y * viewport.zoom + viewport.y;

            let el = this.labelElements.get(edge.id);
            if (!el) {
                el = document.createElement('div');
                el.className = 'sci-flow-edge-label';
                el.style.cssText = `
                    position:absolute; pointer-events:auto; z-index:500;
                    transform:translate(-50%,-50%);
                    background:var(--sf-node-bg,#2a2a2a); color:var(--sf-node-text,#fff);
                    padding:2px 8px; border-radius:4px; font-size:11px;
                    border:1px solid var(--sf-node-border,#444);
                    white-space:nowrap;
                `;
                this.container.appendChild(el);
                this.labelElements.set(edge.id, el);
            }

            el.textContent = String(edge.data.label);
            el.style.left = `${sx}px`;
            el.style.top = `${sy}px`;
        });

        // Remove labels for deleted edges
        for (const [id, el] of this.labelElements.entries()) {
            if (!activeIds.has(id)) {
                el.remove();
                this.labelElements.delete(id);
            }
        }
    }

    public destroy() {
        this.labelElements.forEach(el => el.remove());
        this.labelElements.clear();
    }
}
