import { StateManager } from '../state/StateManager';
import { FlowState } from '../types';

export interface MinimapOptions {
    container: HTMLElement;
    stateManager: StateManager;
    width?: number;
    height?: number;
    nodeColor?: string;
    viewportColor?: string;
    backgroundColor?: string;
}

export class Minimap {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private stateManager: StateManager;
    private options: Required<MinimapOptions>;
    
    private isDragging = false;
    private unsubscribe: () => void;

    constructor(options: MinimapOptions) {
        this.stateManager = options.stateManager;
        this.options = {
            container: options.container,
            stateManager: options.stateManager,
            width: options.width || 150,
            height: options.height || 100,
            nodeColor: options.nodeColor || '#rgba(100, 100, 100, 0.5)',
            viewportColor: options.viewportColor || 'rgba(0, 123, 255, 0.4)',
            backgroundColor: options.backgroundColor || '#111'
        };

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        this.canvas.style.backgroundColor = this.options.backgroundColor;
        this.canvas.style.border = '1px solid #333';
        this.canvas.style.borderRadius = '4px';
        this.canvas.style.cursor = 'crosshair';
        
        this.options.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d')!;

        this.unsubscribe = this.stateManager.subscribe(() => this.render());

        this.bindEvents();
        this.render();
    }

    private bindEvents() {
        this.canvas.addEventListener('pointerdown', this.onPointerDown);
        window.addEventListener('pointermove', this.onPointerMove);
        window.addEventListener('pointerup', this.onPointerUp);
    }

    private unbindEvents() {
        this.canvas.removeEventListener('pointerdown', this.onPointerDown);
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);
    }

    private onPointerDown = (e: PointerEvent) => {
        this.isDragging = true;
        this.canvas.setPointerCapture(e.pointerId);
        this.panToEvent(e);
    };

    private onPointerMove = (e: PointerEvent) => {
        if (!this.isDragging) return;
        this.panToEvent(e);
    };

    private onPointerUp = (e: PointerEvent) => {
        this.isDragging = false;
        if (this.canvas.hasPointerCapture(e.pointerId)) {
            this.canvas.releasePointerCapture(e.pointerId);
        }
    };

    private panToEvent(e: PointerEvent) {
        const state = this.stateManager.getState();
        const rect = this.canvas.getBoundingClientRect();
        
        // Relative position on minimap (0.0 to 1.0)
        let rx = (e.clientX - rect.left) / rect.width;
        let ry = (e.clientY - rect.top) / rect.height;
        
        // Clamp
        rx = Math.max(0, Math.min(1, rx));
        ry = Math.max(0, Math.min(1, ry));

        const bounds = this.getWorldBounds(state);
        
        // Center of the desired viewport in world coordinates
        const targetWorldX = bounds.minX + rx * bounds.width;
        const targetWorldY = bounds.minY + ry * bounds.height;

        // Viewport dimensions in world space
        // Assuming the main canvas size is passed or we approximate it from viewport zoom
        // We lack direct access to main canvas width/height here, so we'll approximate 
        // using the browser window or assume 800x600 if unknown.
        const mainW = window.innerWidth;
        const mainH = window.innerHeight;

        const vx = -targetWorldX * state.viewport.zoom + mainW / 2;
        const vy = -targetWorldY * state.viewport.zoom + mainH / 2;

        this.stateManager.setViewport({ x: vx, y: vy, zoom: state.viewport.zoom });
    }

    private getWorldBounds(state: FlowState) {
        if (state.nodes.size === 0) {
            return { minX: 0, minY: 0, maxX: 1000, maxY: 1000, width: 1000, height: 1000 };
        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        state.nodes.forEach(n => {
            const w = n.style?.width || 200;
            const h = n.style?.height || 150;
            minX = Math.min(minX, n.position.x);
            minY = Math.min(minY, n.position.y);
            maxX = Math.max(maxX, n.position.x + w);
            maxY = Math.max(maxY, n.position.y + h);
        });

        // Add padding
        minX -= 500;
        minY -= 500;
        maxX += 500;
        maxY += 500;

        return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
    }

    private render() {
        if (!this.ctx) return;
        const state = this.stateManager.getState();
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const bounds = this.getWorldBounds(state);
        if (bounds.width === 0 || bounds.height === 0) return;

        const scaleX = this.canvas.width / bounds.width;
        const scaleY = this.canvas.height / bounds.height;
        const scale = Math.min(scaleX, scaleY); // Keep aspect ratio

        // Center map inside canvas if aspect ratios differ
        const offsetX = (this.canvas.width - bounds.width * scale) / 2;
        const offsetY = (this.canvas.height - bounds.height * scale) / 2;

        this.ctx.save();
        this.ctx.translate(offsetX, offsetY);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-bounds.minX, -bounds.minY);

        // Draw Nodes
        this.ctx.fillStyle = this.options.nodeColor;
        state.nodes.forEach(n => {
            const w = n.style?.width || 200;
            const h = n.style?.height || 150;
            
            // Draw rounded rect
            this.ctx.beginPath();
            this.ctx.roundRect(n.position.x, n.position.y, w, h, 10);
            this.ctx.fill();
        });

        // Draw Viewport
        const mainW = window.innerWidth;
        const mainH = window.innerHeight;

        const vpWorldMinX = -state.viewport.x / state.viewport.zoom;
        const vpWorldMinY = -state.viewport.y / state.viewport.zoom;
        const vpWorldMaxX = (mainW - state.viewport.x) / state.viewport.zoom;
        const vpWorldMaxY = (mainH - state.viewport.y) / state.viewport.zoom;

        this.ctx.strokeStyle = this.options.viewportColor;
        this.ctx.lineWidth = 2 / scale;
        this.ctx.fillStyle = this.options.viewportColor;
        
        this.ctx.beginPath();
        this.ctx.rect(vpWorldMinX, vpWorldMinY, vpWorldMaxX - vpWorldMinX, vpWorldMaxY - vpWorldMinY);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
    }

    public destroy() {
        this.unbindEvents();
        this.unsubscribe();
        this.canvas.remove();
    }
}
