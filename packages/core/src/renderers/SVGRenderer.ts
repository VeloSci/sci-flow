import { BaseRenderer, RendererOptions } from './BaseRenderer';
import { FlowState, Node } from '../types';
import { getEdgePath } from '../utils/edges';
import { PathfindingWorkerResponse } from '../workers/pathfinding.worker';
import { SVG_RENDERER_STYLES } from './SVGRendererStyles';
import { getPortAnchor } from '../utils/ports';
import { NodeManager } from './NodeManager';
import { EdgeManager } from './EdgeManager';
import { createPathfindingWorker } from '../workers/workerFactory';

export class SVGRenderer extends BaseRenderer {
  private svg: SVGSVGElement;
  private nodesGroup: SVGGElement;
  private edgesGroup: SVGGElement;
  private styleEl: HTMLStyleElement;
  private routerWorker: Worker;
  private pendingRoutes: Map<string, (path: string) => void> = new Map();
  public routerIdCounter = 0;

  private routeCache: Map<string, string> = new Map();
  private routingHashCache: Map<string, string> = new Map();

  private nodeManager!: NodeManager;
  private edgeManager!: EdgeManager;

  constructor(options: RendererOptions) {
    super(options);
    this.container.classList.add('sci-flow-container');
    
    this.routerWorker = createPathfindingWorker();
    this.routerWorker.onmessage = (e: MessageEvent<PathfindingWorkerResponse>) => {
        const { id, path } = e.data;
        if (this.pendingRoutes.has(id)) {
            this.pendingRoutes.get(id)!(path);
            this.pendingRoutes.delete(id);
        }
    };

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.style.width = '100%';
    this.svg.style.height = '100%';
    this.svg.style.display = 'block';
    this.svg.style.position = 'absolute';
    this.svg.style.top = '0';
    this.svg.style.left = '0';
    this.svg.style.zIndex = '1';
    this.svg.setAttribute('class', 'sci-flow-svg-renderer');

    this.styleEl = document.createElement('style');
    this.styleEl.textContent = SVG_RENDERER_STYLES;
    document.head.appendChild(this.styleEl);

    this.edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.edgesGroup.setAttribute('class', 'sci-flow-edges');
    this.edgesGroup.style.transformOrigin = '0 0';

    this.nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.nodesGroup.setAttribute('class', 'sci-flow-nodes');
    this.nodesGroup.style.transformOrigin = '0 0';

    this.svg.appendChild(this.edgesGroup);
    this.svg.appendChild(this.nodesGroup);
    this.container.appendChild(this.svg);

    this.nodeManager = new NodeManager(this.nodesGroup);
    const self = this;
    this.edgeManager = new EdgeManager(
        this.edgesGroup, 
        this.routerWorker, 
        this.routeCache, 
        this.routingHashCache, 
        this.pendingRoutes, 
        { 
            get value() { return self.routerIdCounter; }, 
            set value(v: number) { self.routerIdCounter = v; } 
        },
        this.getPortAnchor.bind(this)
    );
  }

  public render(state: FlowState, registry: Map<string, any>): void {
    const transform = `translate(${state.viewport.x}, ${state.viewport.y}) scale(${state.viewport.zoom})`;
    this.edgesGroup.setAttribute('transform', transform);
    this.nodesGroup.setAttribute('transform', transform);

    const existingNodeDocs = new Set(Array.from(this.nodesGroup.children).map(n => n.id));
    this.nodeManager.reconcile(state.nodes, existingNodeDocs, (this as any).stateManager, registry);
    
    existingNodeDocs.forEach(id => {
      document.getElementById(id)?.remove();
      const sm = (this as any).stateManager;
      // Extract the original node ID from "node-${node.id}"
      const nodeId = id.replace('node-', '');
      if (sm?.onNodeUnmount) sm.onNodeUnmount(nodeId);
    });

    const obstacles = Array.from(state.nodes.values()).map(n => ({
        id: n.id,
        x: (n as any).position.x,
        y: (n as any).position.y,
        width: (n as any).style?.width || 140,
        height: (n as any).style?.height || 100
    }));

    const existingEdgeDocs = new Set(Array.from(this.edgesGroup.children).map(n => n.id));
    this.edgeManager.reconcile(state, existingEdgeDocs, obstacles);

    existingEdgeDocs.forEach(id => {
      document.getElementById(id)?.remove();
    });

    this.renderDraftEdge(state, obstacles);
  }

  private renderDraftEdge(state: FlowState, obstacles: any[]): void {
    let draftPath = document.getElementById('sci-flow-draft-edge') as SVGPathElement | null;
    if (state.draftEdge) {
        if (!draftPath) {
            draftPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            draftPath.id = 'sci-flow-draft-edge';
            draftPath.setAttribute('class', 'sci-flow-edge sci-flow-draft-edge');
            draftPath.setAttribute('fill', 'none');
            draftPath.setAttribute('stroke', 'var(--sf-edge-animated)');
            draftPath.setAttribute('stroke-width', '3');
            draftPath.setAttribute('stroke-dasharray', '5, 5');
            draftPath.style.pointerEvents = 'none';
            
            if (this.edgesGroup.firstChild) {
                this.edgesGroup.insertBefore(draftPath, this.edgesGroup.firstChild);
            } else {
                this.edgesGroup.appendChild(draftPath);
            }
        }

        const sourceNode = state.nodes.get(state.draftEdge.sourceNodeId);
        if (sourceNode) {
            const sourcePos = this.getPortAnchor(sourceNode, state.draftEdge.sourcePortId);
            const targetPos = state.draftEdge.targetPosition;
            
            // Filter obstacles to exclude the source node while drafting
            const filteredObstacles = obstacles.filter(obs => obs.id !== state.draftEdge?.sourceNodeId);
            
            const routingMode = state.defaultEdgeType || 'bezier';
            const pathString = getEdgePath({ 
                source: sourcePos, 
                target: targetPos, 
                mode: routingMode as any,
                obstacles: filteredObstacles
            });
            draftPath.setAttribute('d', pathString);
        }
    } else if (draftPath) {
        draftPath.remove();
    }
  }

  private getPortAnchor(node: Node, portId: string): { x: number, y: number } {
      return getPortAnchor(node, portId, this.nodesGroup);
  }

  public getViewportElement(): SVGElement {
      return this.svg;
  }

  public destroy(): void {
    this.svg.remove();
    this.styleEl.remove();
    this.routerWorker.terminate();
  }
}
