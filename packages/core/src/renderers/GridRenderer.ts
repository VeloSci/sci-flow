import { BaseRenderer, RendererOptions } from './BaseRenderer';
import { FlowState } from '../types';

export interface GridOptions extends RendererOptions {
    gridSize?: number;
    gridColor?: string;
}

export class GridRenderer extends BaseRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private options: Required<Omit<GridOptions, 'container'>>;

  constructor(options: GridOptions) {
    super(options);
    
    this.options = {
        gridSize: options.gridSize || 20,
        gridColor: options.gridColor || 'rgba(100, 100, 100, 0.2)'
    };
    
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none'; // Grid shouldn't block interactions
    this.canvas.style.zIndex = '0';
    this.canvas.classList.add('sci-flow-grid');
    
    this.ctx = this.canvas.getContext('2d');
    
    // Insert behind everything
    if (this.container.firstChild) {
        this.container.insertBefore(this.canvas, this.container.firstChild);
    } else {
        this.container.appendChild(this.canvas);
    }

    this.resize();
    window.addEventListener('resize', this.resize);
  }

  private resize = () => {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx?.scale(dpr, dpr);
  };

  public render(state: FlowState): void {
      if (!this.ctx) return;
      
      const { x, y, zoom } = state.viewport;
      const rect = this.canvas.getBoundingClientRect();
      
      this.ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Adaptive grid: if scaled size gets too small, step by larger increments
      // This immediately solves the O(N^2) zoom-out performance crash
      let stepMultiplier = 1;
      while (this.options.gridSize * zoom * stepMultiplier < 15) {
          stepMultiplier *= 2; // Keep doubling the grid gap until it's visually pleasing
      }
      
      const scaledSize = this.options.gridSize * zoom * stepMultiplier;

      const colorPrimary = getComputedStyle(this.container).getPropertyValue('--sf-grid-dot').trim() || '#555';
      this.ctx.fillStyle = colorPrimary;
      const dotSize = 1.5;
      
      const offsetX = x % scaledSize;
      const offsetY = y % scaledSize;

      // Draw Intersection dots using high-performance fillRect instead of heavy mathematical arcs
      for (let i = offsetX; i < rect.width; i += scaledSize) {
          for (let j = offsetY; j < rect.height; j += scaledSize) {
              this.ctx.fillRect(i, j, dotSize, dotSize);
          }
      }
  }

  public getViewportElement(): HTMLElement {
      return this.canvas;
  }

  public destroy(): void {
      window.removeEventListener('resize', this.resize);
      this.canvas.remove();
  }
}
