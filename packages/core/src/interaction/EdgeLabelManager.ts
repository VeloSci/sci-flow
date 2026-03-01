import { StateManager } from '../state/StateManager';

/** Manages labels and inline UI elements mounted at edge midpoints. */
export class EdgeLabelManager {
    private labelElements = new Map<string, SVGForeignObjectElement>();

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

        const labelsGroup = this.container.querySelector('.sci-flow-labels');
        if (!labelsGroup) return; // Wait for SVGRenderer to create it

        state.edges.forEach((edge) => {
            if (!edge.data?.label) return;
            activeIds.add(edge.id);

            const midpoint = this.getPathMidpoint(edge.id);
            if (!midpoint) return;

            let foreignObj = this.labelElements.get(edge.id);
            if (!foreignObj || !labelsGroup.contains(foreignObj)) {
                if (foreignObj) foreignObj.remove();

                foreignObj = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
                // Set fixed width/height so it can hold the label, use overflow visible
                foreignObj.setAttribute('width', '1');
                foreignObj.setAttribute('height', '1');
                foreignObj.style.overflow = 'visible';

                const div = document.createElement('div');
                div.className = 'sci-flow-edge-label';
                // Remove inline styling, it is handled by CSS correctly now!
                foreignObj.appendChild(div);
                
                labelsGroup.appendChild(foreignObj);
                this.labelElements.set(edge.id, foreignObj);
            }

            // Position <foreignObject> directly at flow coordinates
            foreignObj.setAttribute('x', String(midpoint.x));
            foreignObj.setAttribute('y', String(midpoint.y));

            const div = foreignObj.firstChild as HTMLDivElement;
            div.textContent = String(edge.data.label);
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
