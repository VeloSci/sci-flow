import { BaseRenderer, RendererOptions } from './BaseRenderer';
import { FlowState, Node, Edge, Position, SmartGuide, Theme } from '../types';
import { NodeDefinition } from '../state/RegistryManager';
import { getEdgePath } from '../utils/edges';
import { getPortAnchor } from '../utils/ports';

export class CanvasRenderer extends BaseRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private animationFrameId: number | null = null;
  private state: FlowState | null = null;
  private registry: Map<string, NodeDefinition> = new Map();
  private theme: Theme | null = null;
  private startTime: number = Date.now();

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
    this.resize();
    window.addEventListener('resize', this.resize);
    this.startAnimationLoop();
  }

  private resize = () => {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    // We don't scale here permanentely because we reset transform in draw()
  };

  private startAnimationLoop() {
    const loop = () => {
      if (this.state && this.theme) this.draw(this.state, this.registry, this.theme);
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  public render(state: FlowState, registry: Map<string, NodeDefinition>, theme: Theme, _dirty?: { nodes: boolean; edges: boolean; viewport: boolean }): void {
    this.state = state;
    this.registry = registry;
    this.theme = theme;
  }

  private draw(state: FlowState, registry: Map<string, NodeDefinition>, theme: Theme) {
    if (!this.ctx) return;
    const dpr = window.devicePixelRatio || 1;
    
    // 1. CLEAR CANVAS: Reset transform to physical pixels and clear all
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. APPLY DPR SCALE: This ensures everything drawn next is sharp
    this.ctx.scale(dpr, dpr);

    this.ctx.save();
    // 3. APPLY VIEWPORT TRANSFORM (Rounded for sharpness)
    this.ctx.translate(Math.round(state.viewport.x), Math.round(state.viewport.y));
    this.ctx.scale(state.viewport.zoom, state.viewport.zoom);

    // Draw Edges
    state.edges.forEach(edge => this.drawEdge(this.ctx!, edge, state, theme));

    // Draw Nodes
    state.nodes.forEach(node => this.drawNode(this.ctx!, node, registry.get(node.type), theme));

    // Draw Smart Guides
    if (state.smartGuides && state.smartGuides.length > 0) this.drawGuides(this.ctx!, state.smartGuides, state.viewport.zoom);

    // Draw Draft Edge
    if (state.draftEdge) this.drawDraftEdge(this.ctx!, state, state.draftEdge, theme);

    this.ctx.restore();
  }

  private drawNode(ctx: CanvasRenderingContext2D, node: Node, def: NodeDefinition | undefined, theme: Theme) {
    const { x, y } = node.position;
    const w = node.style?.width || 160;
    const h = node.style?.height || 160;
    const r = node.style?.borderRadius || 6;

    ctx.save();
    // Round position for pixel perfection
    ctx.translate(Math.round(x), Math.round(y));

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;

    // Body
    ctx.beginPath();
    this.roundRect(ctx, 0, 0, w, h, r);
    ctx.fillStyle = node.style?.backgroundColor || theme.colors.nodeBackground; 
    ctx.fill();
    
    // Reset shadow COMPLETELY before drawing anything else
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Border
    ctx.strokeStyle = node.selected ? theme.colors.nodeSelected : (node.style?.borderColor || theme.colors.nodeBorder); 
    ctx.lineWidth = node.selected ? 2 : 1;
    ctx.stroke();

    // Header
    const headerH = 32;
    ctx.beginPath();
    this.roundRect(ctx, 0, 0, w, headerH, { tl: r, tr: r, bl: 0, br: 0 });
    
    let headerColor = theme.colors.nodeHeaderOps;
    if (node.type === 'math-node') headerColor = theme.colors.nodeHeaderInput;
    if (node.type === 'basic') headerColor = theme.colors.nodeHeaderOutput;
    
    ctx.fillStyle = headerColor;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.stroke();

    // Title
    ctx.fillStyle = theme.colors.nodeHeaderText;
    ctx.font = '600 13px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const title = node.data?.title || (def ? node.type : node.type.toUpperCase());
    ctx.fillText(typeof title === 'string' ? title : String(title), 10, 21);

    // ID
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(node.id.slice(0, 4), w - 10, 21);
    ctx.textAlign = 'left';

    // Custom Canvas Rendering
    if (def?.renderCanvas) {
        ctx.save();
        ctx.translate(0, headerH);
        def.renderCanvas(ctx, node);
        ctx.restore();
    } else {
        ctx.fillStyle = '#666';
        ctx.font = 'italic 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Default Node Content', w/2, headerH + 100);
        ctx.textAlign = 'left';
    }

    ctx.restore();
    this.drawPorts(ctx, node, theme);
  }

  private drawPorts(ctx: CanvasRenderingContext2D, node: Node, theme: Theme) {
    const inputs = Object.keys(node.inputs || {});
    const outputs = Object.keys(node.outputs || {});
    const portSpacing = 26;
    const headerHeight = 32;
    const bodyHeight = 60; // Dedicated content area (matching ports.ts)
    const portsYOffset = headerHeight + bodyHeight;

    const w = node.style?.width || 140;

    // Draw Ports Area Background (Subtle)
    const portCount = Math.max(inputs.length, outputs.length);
    if (portCount > 0) {
      ctx.save();
      ctx.translate(Math.round(node.position.x), Math.round(node.position.y));
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, portsYOffset, w, portCount * portSpacing);
      ctx.restore();
    }

    [...inputs, ...outputs].forEach(portId => {
        const port = node.inputs[portId] || node.outputs[portId];
        const isInput = !!node.inputs[portId];
        const type = isInput ? 'input' : 'output';
        const anchor = getPortAnchor(node, portId, this.container, this.state?.direction);
        
        this.drawPortCircle(ctx, anchor.x, anchor.y, portId, node, type, port.dataType || 'any', theme);
        
        // Draw Labels
        if (this.state?.direction !== 'vertical') {
          ctx.save();
          ctx.fillStyle = '#888';
          ctx.font = '500 11px Inter, sans-serif';
          ctx.textBaseline = 'middle';
          
          if (isInput) {
            ctx.textAlign = 'left';
            ctx.fillText(port.label || portId, anchor.x + 12, anchor.y);
          } else {
            ctx.textAlign = 'right';
            ctx.fillText(port.label || portId, anchor.x - 12, anchor.y);
          }
          ctx.restore();
        }
    });
  }

  private drawPortCircle(ctx: CanvasRenderingContext2D, x: number, y: number, id: string, node: Node, type: 'input' | 'output', dataType: string, theme: Theme) {
    const highlighted = this.state?.highlightedConnection;
    const isSelected = highlighted?.nodeId === node.id && highlighted?.portId === id && highlighted?.type === type;
    
    const typeColors: Record<string, string> = {
        'number': '#a1a1a1',
        'string': '#45a3e5',
        'boolean': '#cc7070',
        'any': '#e3b034',
        'object': '#8b5cf6'
    };

    ctx.beginPath();
    ctx.arc(x, y, isSelected ? 8 : 5, 0, Math.PI * 2);
    
    if (isSelected) {
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = theme.colors.portActive;
    } else {
        ctx.fillStyle = typeColors[dataType] || theme.colors.portBackground;
    }
    
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.strokeStyle = isSelected ? theme.colors.portActive : (isSelected ? '#fff' : theme.colors.portBorder);
    ctx.lineWidth = isSelected ? 3 : 1.5;
    ctx.stroke();
  }

  private drawEdge(ctx: CanvasRenderingContext2D, edge: Edge, state: FlowState, theme: Theme) {
    const sourceNode = state.nodes.get(edge.source);
    const targetNode = state.nodes.get(edge.target);
    if (!sourceNode || !targetNode || !edge.sourceHandle || !edge.targetHandle) return;

    const sourcePos = getPortAnchor(sourceNode, edge.sourceHandle, this.container, state.direction);
    const targetPos = getPortAnchor(targetNode, edge.targetHandle, this.container, state.direction);

    ctx.fillStyle = theme.colors.background;
    ctx.strokeStyle = edge.selected ? theme.colors.edgeActive : theme.colors.edgeLine;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(sourcePos.x, sourcePos.y, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(targetPos.x, targetPos.y, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    const pathString = getEdgePath({
      source: sourcePos,
      target: targetPos,
      mode: edge.type || 'bezier'
    });

    const path = new Path2D(pathString);
    
    ctx.strokeStyle = edge.selected ? theme.colors.edgeActive : (edge.style?.stroke || theme.colors.edgeLine);
    ctx.lineWidth = edge.selected ? 3 : (edge.style?.strokeWidth || 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke(path);

    if (edge.animated) {
        this.drawBeam(ctx, path, edge.style?.animationDuration, theme);
    }
  }

  private drawBeam(ctx: CanvasRenderingContext2D, path: Path2D, duration: string | number | undefined, theme: Theme) {
    const dur = typeof duration === 'number' ? duration : parseFloat(duration || '2');
    const t = ((Date.now() - this.startTime) % (dur * 1000)) / (dur * 1000);
    
    ctx.save();
    ctx.setLineDash([60, 200]); 
    ctx.lineDashOffset = 60 - t * 260; 
    
    ctx.shadowBlur = 6;
    ctx.shadowColor = theme.colors.edgeAnimated;
    ctx.strokeStyle = theme.colors.edgeAnimated;
    ctx.lineWidth = 4;
    ctx.stroke(path);
    ctx.restore();
  }

  private drawDraftEdge(ctx: CanvasRenderingContext2D, state: FlowState, draft: { sourceNodeId: string, sourcePortId: string, targetPosition: Position }, theme: Theme) {
    const sourceNode = state.nodes.get(draft.sourceNodeId);
    if (!sourceNode) return;

    const sourcePos = getPortAnchor(sourceNode, draft.sourcePortId, this.container, state.direction);
    const path = new Path2D(getEdgePath({
      source: sourcePos,
      target: draft.targetPosition,
      mode: state.defaultEdgeType || 'bezier'
    }));

    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = theme.colors.edgeActive;
    ctx.lineWidth = 2;
    ctx.stroke(path);
    ctx.restore();
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | { tl: number, tr: number, bl: number, br: number }) {
    const radius = typeof r === 'number' ? { tl: r, tr: r, bl: r, br: r } : r;
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + w - radius.tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius.tr);
    ctx.lineTo(x + w, y + h - radius.br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius.br, y + h);
    ctx.lineTo(x + radius.bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
  }

  private drawGuides(ctx: CanvasRenderingContext2D, guides: SmartGuide[], zoom: number) {
    ctx.strokeStyle = '#e20f86';
    ctx.lineWidth = 1 / zoom;
    ctx.setLineDash([4 / zoom, 4 / zoom]);
    guides.forEach(g => {
      ctx.beginPath();
      if (g.x !== undefined) { ctx.moveTo(g.x, -1e5); ctx.lineTo(g.x, 1e5); }
      if (g.y !== undefined) { ctx.moveTo(-1e5, g.y); ctx.lineTo(1e5, g.y); }
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  public getViewportElement(): HTMLElement { return this.canvas; }
  public destroy(): void {
    window.removeEventListener('resize', this.resize);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.canvas.remove();
  }
}
