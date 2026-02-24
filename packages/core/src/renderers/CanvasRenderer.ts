import { BaseRenderer, RendererOptions } from './BaseRenderer';
import { FlowState } from '../types';
import { NodeDefinition } from '../state/RegistryManager';

export class CanvasRenderer extends BaseRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private animationFrameId: number | null = null;
  private state: FlowState | null = null;

  private registry: Map<string, NodeDefinition> = new Map();

  constructor(options: RendererOptions) {
    super(options);
    
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '1';
    this.canvas.classList.add('sci-flow-canvas-renderer');
    
    this.ctx = this.canvas.getContext('2d');
    
    this.container.appendChild(this.canvas);

    // Initialize dimensions
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  private resize = () => {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx?.scale(dpr, dpr);
    
    if (this.state) {
        this.render(this.state, this.registry);
    }
  };

  public render(state: FlowState, registry: Map<string, NodeDefinition>): void {
    this.state = state;
    this.registry = registry;
    
    if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
    }
    
    this.animationFrameId = requestAnimationFrame(() => this.draw(state, registry));
  }

  private draw(state: FlowState, registry: Map<string, NodeDefinition>) {
    // Avoid ts-unused-vars warning for registry until implemented
    void registry;
    if (!this.ctx) return;
    
    const rect = this.canvas.getBoundingClientRect();
    
    // Clear canvas
    this.ctx.clearRect(0, 0, rect.width, rect.height);
    
    this.ctx.save();
    
    // Apply viewport transform
    this.ctx.translate(state.viewport.x, state.viewport.y);
    this.ctx.scale(state.viewport.zoom, state.viewport.zoom);
    
    // TODO: Draw edges
    
    // TODO: Draw nodes

    // Draw Smart Guides (untransformed by zoom, drawn in flow coords but spanning a huge length)
    if (state.smartGuides && state.smartGuides.length > 0) {
      this.ctx.strokeStyle = '#e20f86'; // Pink
      this.ctx.lineWidth = 1 / state.viewport.zoom;
      this.ctx.setLineDash([4 / state.viewport.zoom, 4 / state.viewport.zoom]);

      for (const guide of state.smartGuides) {
         this.ctx.beginPath();
         if (guide.x !== undefined) {
             this.ctx.moveTo(guide.x, -100000);
             this.ctx.lineTo(guide.x, 100000);
         }
         if (guide.y !== undefined) {
             this.ctx.moveTo(-100000, guide.y);
             this.ctx.lineTo(100000, guide.y);
         }
         this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }

  public getViewportElement(): HTMLElement {
      return this.canvas;
  }

  public destroy(): void {
    window.removeEventListener('resize', this.resize);
    if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
    }
    this.canvas.remove();
  }
}
