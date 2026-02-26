export interface EdgeAnnotation {
    id: string;
    edgeId: string;
    position: 'start' | 'quarter' | 'mid' | 'three-quarter' | 'end';
    content: string;
    style?: Record<string, string>;
}

const POSITION_RATIOS = {
    start: 0.05,
    quarter: 0.25,
    mid: 0.5,
    'three-quarter': 0.75,
    end: 0.95,
};

/** Rich annotations along edge paths at configurable positions. */
export class EdgeAnnotationManager {
    private annotations = new Map<string, EdgeAnnotation>();
    private elements = new Map<string, HTMLDivElement>();

    constructor(private container: HTMLElement) {}

    /** Add an annotation to an edge. */
    public add(edgeId: string, content: string, position: EdgeAnnotation['position'] = 'mid'): EdgeAnnotation {
        const id = `ann-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
        const ann: EdgeAnnotation = { id, edgeId, position, content };
        this.annotations.set(id, ann);
        return ann;
    }

    public remove(id: string) {
        this.annotations.delete(id);
        this.elements.get(id)?.remove();
        this.elements.delete(id);
    }

    /** Update annotation positions based on rendered paths. */
    public reconcile(viewport: { x: number; y: number; zoom: number }) {
        this.annotations.forEach((ann) => {
            const group = this.container.querySelector(`#edge-group-${ann.edgeId}`);
            const pathEl = group?.querySelector('.sci-flow-edge-fg') as SVGPathElement | null;
            if (!pathEl) return;

            try {
                const totalLen = pathEl.getTotalLength();
                const ratio = POSITION_RATIOS[ann.position];
                const point = pathEl.getPointAtLength(totalLen * ratio);

                const sx = point.x * viewport.zoom + viewport.x;
                const sy = point.y * viewport.zoom + viewport.y;

                let el = this.elements.get(ann.id);
                if (!el) {
                    el = document.createElement('div');
                    el.className = 'sci-flow-edge-annotation';
                    el.style.cssText = `
                        position:absolute; pointer-events:auto; z-index:490;
                        transform:translate(-50%,-50%);
                        background:var(--sf-node-bg,#2a2a2a); color:var(--sf-node-text,#fff);
                        padding:2px 6px; border-radius:3px; font-size:10px;
                        border:1px solid var(--sf-node-border,#444);
                        white-space:nowrap;
                    `;
                    this.container.appendChild(el);
                    this.elements.set(ann.id, el);
                }

                el.textContent = ann.content;
                el.style.left = `${sx}px`;
                el.style.top = `${sy}px`;
            } catch { /* path not ready */ }
        });
    }

    public getAnnotationsForEdge(edgeId: string): EdgeAnnotation[] {
        return [...this.annotations.values()].filter(a => a.edgeId === edgeId);
    }

    public destroy() {
        this.elements.forEach(el => el.remove());
        this.elements.clear();
        this.annotations.clear();
    }
}
