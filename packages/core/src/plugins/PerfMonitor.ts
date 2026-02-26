/** Built-in FPS/memory/node-count performance monitoring overlay. */
export class PerfMonitor {
    private overlay: HTMLDivElement | null = null;
    private frameCount = 0;
    private lastFPSTime = 0;
    private fps = 0;
    private rafId = 0;
    private visible = false;

    constructor(private container: HTMLElement) {}

    /** Show the performance overlay. */
    public show() {
        if (this.visible) return;
        this.visible = true;
        this.overlay = document.createElement('div');
        this.overlay.className = 'sci-flow-perf-monitor';
        this.overlay.style.cssText = `
            position:absolute; top:8px; left:8px; z-index:9999;
            background:rgba(0,0,0,0.85); color:#0f0; padding:8px 12px;
            border-radius:4px; font-family:monospace; font-size:11px;
            pointer-events:none; line-height:1.5;
        `;
        this.container.appendChild(this.overlay);
        this.lastFPSTime = performance.now();
        this.tick();
    }

    /** Hide the performance overlay. */
    public hide() {
        this.visible = false;
        if (this.overlay) { this.overlay.remove(); this.overlay = null; }
        if (this.rafId) cancelAnimationFrame(this.rafId);
    }

    public toggle() { if (this.visible) { this.hide(); } else { this.show(); } }

    private tick = () => {
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFPSTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFPSTime = now;
        }

        if (this.overlay) {
            const nodes = this.container.querySelectorAll('.sci-flow-node-group').length;
            const edges = this.container.querySelectorAll('.sci-flow-edge-group').length;
            const mem = (performance as unknown as { memory?: { usedJSHeapSize: number } })
                .memory?.usedJSHeapSize;
            const memStr = mem ? `${(mem / 1024 / 1024).toFixed(1)}MB` : 'N/A';

            this.overlay.innerHTML = `
                <div>FPS: <b>${this.fps}</b></div>
                <div>Nodes: ${nodes} | Edges: ${edges}</div>
                <div>Heap: ${memStr}</div>
            `;
        }

        if (this.visible) this.rafId = requestAnimationFrame(this.tick);
    };

    public getFPS(): number { return this.fps; }
    public isVisible(): boolean { return this.visible; }
    public destroy() { this.hide(); }
}
