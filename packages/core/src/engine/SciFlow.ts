import { StateManager } from '../state/StateManager';
import { SVGRenderer } from '../renderers/SVGRenderer';
import { CanvasRenderer } from '../renderers/CanvasRenderer';
import { BaseRenderer } from '../renderers/BaseRenderer';
import { GridRenderer } from '../renderers/GridRenderer';
import { InteractionManager } from '../interaction/InteractionManager';
import { Node, Edge, FlowState, Theme } from '../types';
import { ThemeManager } from '../theme/ThemeManager';
import { PluginHost, type PluginHostOptions } from '../plugins/PluginHost';

export interface SciFlowOptions {
  container: HTMLElement;
  renderer?: 'svg' | 'canvas' | 'auto';
  autoSwitchThreshold?: number;
  theme?: Partial<Theme> | 'light' | 'dark' | 'system';
  direction?: 'horizontal' | 'vertical';
  minZoom?: number;
  maxZoom?: number;
  plugins?: PluginHostOptions;
}

export class SciFlow {
  private container: HTMLElement;
  public stateManager: StateManager;
  private interactionManager: InteractionManager;
  private renderer: BaseRenderer;
  private gridRenderer: GridRenderer;
  private options: SciFlowOptions;
  private unsubscribe: () => void;
  private themeManager: ThemeManager;
  public plugins: PluginHost;

  constructor(options: SciFlowOptions) {
    this.options = { renderer: 'auto', autoSwitchThreshold: 1000, theme: 'light', ...options };
    this.container = this.options.container;

    // Ensure container has styling
    if (getComputedStyle(this.container).position === 'static') {
      this.container.style.position = 'relative';
    }

    this.stateManager = new StateManager();

    this.themeManager = new ThemeManager(this.container, this.stateManager.id);
    this.themeManager.setTheme(this.options.theme);

    if (this.options.direction) {
      this.stateManager.setDirection(this.options.direction);
    }

    // Initialize plugins before InteractionManager so they can be injected
    this.plugins = new PluginHost(this.container, this.stateManager, this.stateManager.history, this.options.plugins);

    this.interactionManager = new InteractionManager({
      container: this.container,
      stateManager: this.stateManager,
      minZoom: this.options.minZoom,
      maxZoom: this.options.maxZoom,
      plugins: this.plugins // Add plugins here
    });

    this.gridRenderer = new GridRenderer({ container: this.container });

    // Initial renderer setup
    const initialRendererType = this.options.renderer === 'auto' ? 'svg' : (this.options.renderer || 'svg');
    this.renderer = this.createRenderer(initialRendererType);
    this.renderer.stateManager = this.stateManager;

    // Bind Shortcut Customizer Actions
    this.plugins.shortcuts.onAction('fitView', () => { this.fitView(); });

    // Subscribe to state changes and trigger render
    this.unsubscribe = this.stateManager.subscribe((state: FlowState) => {
      this.gridRenderer.render(state);
      this.renderer.render(state, this.stateManager.getNodeRegistry());
      this.plugins.onStateChange();
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
    this.renderer.render(this.stateManager.getState(), this.stateManager.getNodeRegistry());
  }

  public setTheme(themeOpt?: Partial<Theme> | 'light' | 'dark' | 'system') {
    this.themeManager.setTheme(themeOpt);
  }

  public setDirection(dir: 'horizontal' | 'vertical') {
    this.stateManager.setDirection(dir);
  }

  // --- API Methods ---
  public setNodes(nodes: Node[]) {
    this.stateManager.setNodes(nodes);
  }

  public setEdges(edges: Edge[]) {
    this.stateManager.setEdges(edges);
  }

  public addNode(node: Node) {
    this.stateManager.addNode(node);
  }

  public removeNode(id: string) {
    this.stateManager.removeNode(id);
  }

  public addEdge(edge: Edge) {
    this.stateManager.addEdge(edge);
  }

  public removeEdge(id: string) {
    this.stateManager.removeEdge(id);
  }

  public getState(): FlowState {
    return this.stateManager.getState();
  }

  public forceUpdate() {
    this.stateManager.forceUpdate();
  }

  public setDefaultEdgeType(type: 'straight' | 'bezier' | 'step' | 'smart') {
    this.stateManager.setDefaultEdgeType(type);
  }

  public setDefaultEdgeStyle(style: Partial<Edge['style']>) {
    this.stateManager.setDefaultEdgeStyle(style);
  }

  public subscribe(listener: (state: FlowState) => void): () => void {
    return this.stateManager.subscribe(listener);
  }

  public updateNodePosition(id: string, x: number, y: number) {
    this.stateManager.updateNodePosition(id, x, y);
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
    this.themeManager.destroy();
    this.plugins.destroy();
    this.gridRenderer.destroy();
    this.renderer.destroy();
  }
}
