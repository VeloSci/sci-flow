import { StateManager } from '../state/StateManager';
import { SVGRenderer } from '../renderers/SVGRenderer';
import { CanvasRenderer } from '../renderers/CanvasRenderer';
import { BaseRenderer } from '../renderers/BaseRenderer';
import { GridRenderer } from '../renderers/GridRenderer';
import { InteractionManager } from '../interaction/InteractionManager';
import { Node, Edge, FlowState, Theme } from '../types';
import { lightTheme, darkTheme } from '../theme/defaultThemes';

export interface SciFlowOptions {
  container: HTMLElement;
  renderer?: 'svg' | 'canvas' | 'auto';
  autoSwitchThreshold?: number; // Node count where auto switch to canvas occurs
  theme?: Partial<Theme> | 'light' | 'dark' | 'system';
  minZoom?: number;
  maxZoom?: number;
}

export class SciFlow {
  private container: HTMLElement;
  private stateManager: StateManager;
  private interactionManager: InteractionManager;
  private renderer: BaseRenderer;
  private gridRenderer: GridRenderer;
  private options: SciFlowOptions;
  private unsubscribe: () => void;
  
  // Theming State
  private currentTheme: Theme = lightTheme;
  private styleInjector?: HTMLStyleElement;

  constructor(options: SciFlowOptions) {
    this.options = { renderer: 'auto', autoSwitchThreshold: 1000, theme: 'light', ...options };
    this.container = this.options.container;
    
    // Ensure container has styling
    if (getComputedStyle(this.container).position === 'static') {
        this.container.style.position = 'relative';
    }
    
    this.stateManager = new StateManager();
    
    // Setup Theming early so renderers inherit CSS variables instantly
    this.setupTheming(this.options.theme);

    this.interactionManager = new InteractionManager({
        container: this.container,
        stateManager: this.stateManager,
        minZoom: this.options.minZoom,
        maxZoom: this.options.maxZoom
    });
    
    this.gridRenderer = new GridRenderer({ container: this.container });

    // Initial renderer setup
    const initialRendererType = this.options.renderer === 'auto' ? 'svg' : (this.options.renderer || 'svg');
    this.renderer = this.createRenderer(initialRendererType);
    (this.renderer as any).stateManager = this.stateManager;

    // Subscribe to state changes and trigger render
    this.unsubscribe = this.stateManager.subscribe((state: FlowState) => {
      // Pass the node registry map via a getter for the renderer to instanciate nodes
      this.gridRenderer.render(state);
      this.renderer.render(state, this.stateManager['nodeRegistry']);
      this.checkRendererThreshold(state.nodes.size);
    });
  }

  private createRenderer(type: 'svg' | 'canvas'): BaseRenderer {
    return type === 'svg'
      ? new SVGRenderer({ container: this.container })
      : new CanvasRenderer({ container: this.container });
  }

  private checkRendererThreshold(nodeCount: number) {
    if (this.options.renderer === 'auto') {
      const threshold = this.options.autoSwitchThreshold || 1000;
      const currentIsCanvas = this.renderer instanceof CanvasRenderer;

      if (nodeCount > threshold && !currentIsCanvas) {
        this.switchRenderer('canvas');
      } else if (nodeCount <= threshold && currentIsCanvas) {
        this.switchRenderer('svg');
      }
    }
  }

  private switchRenderer(type: 'svg' | 'canvas') {
    this.renderer.destroy();
    this.renderer = this.createRenderer(type);
    
    // Re-render immediately on the new renderer
    this.renderer.render(this.stateManager.getState(), this.stateManager['nodeRegistry']);
  }

  // --- Theming API ---
  private setupTheming(themeOpt?: Partial<Theme> | 'light' | 'dark' | 'system') {
      this.styleInjector = document.createElement('style');
      this.styleInjector.id = 'sci-flow-theme-injector';
      this.container.appendChild(this.styleInjector);
      this.setTheme(themeOpt);
  }

  public setTheme(themeOpt?: Partial<Theme> | 'light' | 'dark' | 'system') {
      let baseTheme = lightTheme;
      
      if (themeOpt === 'dark') {
          baseTheme = darkTheme;
      } else if (themeOpt === 'system') {
          baseTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? darkTheme : lightTheme;
      } else if (typeof themeOpt === 'object') {
          // If they passed partial theme options, detect if it's meant to be dark or light as a baseline
          baseTheme = (themeOpt.name === 'dark' ? darkTheme : lightTheme);
      }

      // Merge user overrides if object
      this.currentTheme = typeof themeOpt === 'object' ? {
          name: themeOpt.name || baseTheme.name,
          colors: { ...baseTheme.colors, ...(themeOpt.colors || {}) }
      } : baseTheme;

      this.applyThemeVariables();
  }

  private applyThemeVariables() {
      if (!this.styleInjector) return;
      
      const colors = this.currentTheme.colors;
      const cssVars = `
        .sci-flow-container-${this.stateManager?.id || 'root'} {
            --sf-bg: ${colors.background};
            --sf-grid-dot: ${colors.gridDot};
            --sf-node-bg: ${colors.nodeBackground};
            --sf-node-border: ${colors.nodeBorder};
            --sf-node-text: ${colors.nodeText};
            --sf-edge-line: ${colors.edgeLine};
            --sf-edge-active: ${colors.edgeActive};
            --sf-edge-animated: ${colors.edgeAnimated};
            --sf-port-bg: ${colors.portBackground};
            --sf-port-border: ${colors.portBorder};
            --sf-context-bg: ${colors.contextMenuBackground};
            --sf-context-text: ${colors.contextMenuText};
            --sf-context-hover: ${colors.contextMenuHover};
            --sf-selection-bg: ${colors.selectionBoxBackground};
            --sf-selection-border: ${colors.selectionBoxBorder};
        }
        
        /* Edge Hover Effects */
        .sci-flow-container-${this.stateManager?.id || 'root'} .sci-flow-edge-bg:hover + .sci-flow-edge-fg {
            stroke: var(--sf-edge-active) !important;
            stroke-width: 3px !important;
        }
        
        .sci-flow-container-${this.stateManager?.id || 'root'} .sci-flow-edge-bg:hover ~ circle {
            stroke: var(--sf-edge-active) !important;
            stroke-width: 3px !important;
            transform: scale(1.5);
            transform-origin: center;
            transform-box: fill-box;
        }

        /* Node Hover Effects */
        .sci-flow-container-${this.stateManager?.id || 'root'} .sci-flow-node:hover > foreignObject > div {
            box-shadow: 0 0 15px var(--sf-edge-active) !important;
            transition: box-shadow 0.2s ease;
        }

        /* Dragging State: Prevent text selection globally while user holds click */
        .sci-flow-container-${this.stateManager?.id || 'root'}.sci-flow-dragging * {
            user-select: none !important;
            -webkit-user-select: none !important;
        }
      `;
      
      this.styleInjector.innerHTML = cssVars;
      this.container.classList.add(`sci-flow-container-${this.stateManager?.id || 'root'}`);
  }

  // --- API Methods ---
  public setNodes(nodes: Node[]) {
    this.stateManager.setNodes(nodes);
  }

  public setEdges(edges: Edge[]) {
    this.stateManager.setEdges(edges);
  }

  public fitView(padding = 50) {
    const state = this.stateManager.getState();
    if (state.nodes.size === 0) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    state.nodes.forEach(node => {
      const nw = node.style?.width || 200;
      const nh = node.style?.height || 150;
      if (node.position.x < minX) minX = node.position.x;
      if (node.position.y < minY) minY = node.position.y;
      if (node.position.x + nw > maxX) maxX = node.position.x + nw;
      if (node.position.y + nh > maxY) maxY = node.position.y + nh;
    });

    const boundsWidth = maxX - minX;
    const boundsHeight = maxY - minY;
    
    // Fallback if nodes are exactly at same pos
    if (boundsWidth <= 0 || boundsHeight <= 0) return;

    const rect = this.container.getBoundingClientRect();
    const cw = rect.width - padding * 2;
    const ch = rect.height - padding * 2;

    const zoomX = cw / boundsWidth;
    const zoomY = ch / boundsHeight;
    const newZoom = Math.min(Math.max(Math.min(zoomX, zoomY), 0.1), 2); // clamped to interaction bounds

    const centerX = minX + boundsWidth / 2;
    const centerY = minY + boundsHeight / 2;

    const newX = (rect.width / 2) - (centerX * newZoom);
    const newY = (rect.height / 2) - (centerY * newZoom);

    this.stateManager.setViewport({ x: newX, y: newY, zoom: newZoom });
  }

  public centerNode(id: string) {
    const state = this.stateManager.getState();
    const node = state.nodes.get(id);
    if (!node) return;

    const nw = node.style?.width || 200;
    const nh = node.style?.height || 150;

    const centerX = node.position.x + nw / 2;
    const centerY = node.position.y + nh / 2;

    const rect = this.container.getBoundingClientRect();
    const currentZoom = state.viewport.zoom;

    const newX = (rect.width / 2) - (centerX * currentZoom);
    const newY = (rect.height / 2) - (centerY * currentZoom);

    this.stateManager.setViewport({ x: newX, y: newY, zoom: currentZoom });
  }

  public toJSON(): string {
    return this.stateManager.toJSON();
  }

  public fromJSON(jsonString: string) {
    this.stateManager.fromJSON(jsonString);
  }

  public destroy() {
    this.unsubscribe();
    this.interactionManager.destroy();
    this.gridRenderer.destroy();
    this.renderer.destroy();
  }
}
