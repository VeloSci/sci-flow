import { FlowState, Node, Edge, ViewportState, Position } from '../types';

type Listener = (state: FlowState) => void;

// Interface defining the behavior of a registered Node component/type
export interface NodeDefinition {
  type: string;
  renderHTML?: (node: Node) => HTMLElement; // For HTML/SVG nodes
  renderCanvas?: (ctx: CanvasRenderingContext2D, node: Node) => void; // For Canvas nodes
  defaultStyle?: Partial<Node['style']>;
  evaluate?: (inputs: Record<string, any>, nodeData: any) => Record<string, any>; // Secure execution logic
}

export class StateManager {
  private state: FlowState;
  private listeners: Set<(state: FlowState) => void> = new Set();
  public readonly id: string; // Used to scope CSS variables dynamically
  
  // History Stack (Undo/Redo)
  private history: string[] = [];
  
  // Custom Node Registry
  private historyIndex: number = -1;
  private maxHistory: number = 50;
  private isRestoringHistory: boolean = false;
  
  // Registry for node definitions (the core engine stores the definitions so renderers can look them up)
  private nodeRegistry: Map<string, NodeDefinition> = new Map();

  public onNodesChange?: (nodes: Node[]) => void;
  public onEdgesChange?: (edges: Edge[]) => void;
  
  public onNodeContextMenu?: (event: MouseEvent, node: Node) => void;
  public onEdgeContextMenu?: (event: MouseEvent, edge: Edge) => void;
  public onPaneContextMenu?: (event: MouseEvent) => void;
  
  public onConnect?: (connection: { source: string, sourceHandle: string, target: string, targetHandle: string }) => void;

  // Framework integration callbacks for Portals/Teleports
  public onNodeMount?: (nodeId: string, container: HTMLElement) => void;
  public onNodeUnmount?: (nodeId: string) => void;

  constructor(initialState?: Partial<FlowState>) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.state = {
      nodes: new Map(),
      edges: new Map(),
      viewport: { x: 0, y: 0, zoom: 1 },
      defaultEdgeType: 'bezier',
      defaultEdgeStyle: { lineStyle: 'solid' },
      ...initialState
    };
  }

  // --- Node Registry ---
  
  public registerNodeType(definition: NodeDefinition) {
    this.nodeRegistry.set(definition.type, definition);
  }

  public getNodeDefinition(type: string): NodeDefinition | undefined {
    return this.nodeRegistry.get(type);
  }

  public getRegisteredNodeTypes(): string[] {
    return Array.from(this.nodeRegistry.keys());
  }

  public getState(): FlowState {
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  public forceUpdate() {
    this.notify();
  }

  // --- State Manipulation for Interaction ---

  public setNodes(nodes: Node[]) {
    this.state.nodes.clear();
    nodes.forEach((n) => this.state.nodes.set(n.id, n));
    this.notify();
  }

  public setSelection(nodeIds: string[], edgeIds: string[]) {
      // Clear previous selection
      this.state.nodes.forEach(n => n.selected = false);
      this.state.edges.forEach(e => e.selected = false);
      
      // Apply new
      nodeIds.forEach(id => {
          const n = this.state.nodes.get(id);
          if (n) n.selected = true;
      });
      edgeIds.forEach(id => {
          const e = this.state.edges.get(id);
          if (e) e.selected = true;
      });
      
      this.notify();
  }

  public appendSelection(nodeId?: string, edgeId?: string) {
      if (nodeId) {
          const n = this.state.nodes.get(nodeId);
          if (n) n.selected = !n.selected;
      }
      if (edgeId) {
          const e = this.state.edges.get(edgeId);
          if (e) e.selected = !e.selected;
      }
      this.notify();
  }

  public addNode(node: Node) {
    this.state.nodes.set(node.id, node);
    this.notify();
  }

  // --- Edge Drafting ---
  public setDraftEdge(sourceNodeId: string, sourcePortId: string, targetPosition: Position) {
      this.state.draftEdge = { sourceNodeId, sourcePortId, targetPosition };
      this.notify();
  }

  public clearDraftEdge() {
      this.state.draftEdge = undefined;
      this.notify();
  }

  // --- Default Styling ---
  public setDefaultEdgeType(type: 'straight' | 'bezier' | 'step' | 'smart') {
      this.state.defaultEdgeType = type;
      this.notify();
  }

  public setDefaultEdgeStyle(style: any) {
      this.state.defaultEdgeStyle = { ...this.state.defaultEdgeStyle, ...style };
      this.notify();
  }

  // --- Smart Guides ---
  public setSmartGuides(guides: { x?: number, y?: number }[]) {
      this.state.smartGuides = guides;
      this.notify();
  }

  public clearSmartGuides() {
      this.state.smartGuides = undefined;
      this.notify();
  }

  // --- History (Undo/Redo) ---
  
  public saveSnapshot() {
      if (this.isRestoringHistory) return;
      
      // Serialize current nodes and edges
      const snapshot = JSON.stringify({
          nodes: Array.from(this.state.nodes.entries()),
          edges: Array.from(this.state.edges.entries())
      });

      // If we are not at the end of the history stack, truncate future history
      if (this.historyIndex < this.history.length - 1) {
          this.history = this.history.slice(0, this.historyIndex + 1);
      }

      // Avoid saving identical consecutive snapshots
      if (this.history.length > 0 && this.history[this.historyIndex] === snapshot) {
          return;
      }

      this.history.push(snapshot);
      if (this.history.length > this.maxHistory) {
          this.history.shift(); // Remove oldest
      } else {
          this.historyIndex++;
      }
  }

  public undo() {
      if (this.historyIndex > 0) {
          this.historyIndex--;
          this.restoreSnapshot(this.history[this.historyIndex]);
      }
  }

  public redo() {
      if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.restoreSnapshot(this.history[this.historyIndex]);
      }
  }

  private restoreSnapshot(snapshotJson: string) {
      if (!snapshotJson) return;
      
      this.isRestoringHistory = true;
      try {
          const parsed = JSON.parse(snapshotJson);
          this.state.nodes = new Map(parsed.nodes);
          this.state.edges = new Map(parsed.edges);
          this.notify();
      } catch(e) {
          console.error("Failed to restore history snapshot", e);
      }
      this.isRestoringHistory = false;
  }

  // --- Node / Edge Mutations ---

  public removeNode(id: string) {
    // Collect the node and all its descendants to remove them together
    const descendants = this.getDescendants([id]);
    const nodesToRemove = new Set([id, ...descendants]);

    for (const nodeId of nodesToRemove) {
        this.state.nodes.delete(nodeId);
        // Also remove connected edges for each removed node
        for (const [edgeId, edge] of this.state.edges.entries()) {
          if (edge.source === nodeId || edge.target === nodeId) {
            this.state.edges.delete(edgeId);
          }
        }
    }
    
    this.notify();
    this.saveSnapshot();
    this.onNodesChange?.(Array.from(this.state.nodes.values()));
    this.onEdgesChange?.(Array.from(this.state.edges.values()));
  }

  // --- Helper ---
  private getDescendants(parentIds: string[]): string[] {
      const descendants = new Set<string>();
      const parentsToProcess = [...parentIds];

      while (parentsToProcess.length > 0) {
          const currentParent = parentsToProcess.pop()!;
          
          for (const [nodeId, node] of this.state.nodes.entries()) {
              if (node.parentId === currentParent && !descendants.has(nodeId)) {
                  descendants.add(nodeId);
                  parentsToProcess.push(nodeId);
              }
          }
      }

      return Array.from(descendants);
  }

  public updateNodePosition(id: string, x: number, y: number, silent: boolean = false) {
    const node = this.state.nodes.get(id);
    if (node) {
      node.position = { x, y };
      this.notify();
      if (!silent) {
          this.onNodesChange?.(Array.from(this.state.nodes.values()));
      }
    }
  }

  public commitNodePositions() {
      this.onNodesChange?.(Array.from(this.state.nodes.values()));
  }

  public setEdges(edges: Edge[]) {
    this.state.edges.clear();
    edges.forEach((e) => this.state.edges.set(e.id, e));
    this.notify();
    this.saveSnapshot();
    this.onEdgesChange?.(Array.from(this.state.edges.values()));
  }

  public addEdge(edge: Edge) {
    this.state.edges.set(edge.id, edge);
    this.notify();
    this.saveSnapshot();
    this.onEdgesChange?.(Array.from(this.state.edges.values()));
  }

  public removeEdge(id: string) {
    this.state.edges.delete(id);
    this.notify();
  }

  public setViewport(viewport: ViewportState) {
    this.state.viewport = viewport;
    this.notify();
  }

  // --- Serialization ---
  
  public toJSON(): string {
      return JSON.stringify({
          version: 'sci-flow-1.0',
          nodes: Array.from(this.state.nodes.values()),
          edges: Array.from(this.state.edges.values()),
          viewport: this.state.viewport
      });
  }

  public fromJSON(jsonString: string) {
      try {
          const data = JSON.parse(jsonString);
          if (data.version !== 'sci-flow-1.0') {
              console.warn('Unknown or unsupported SciFlow JSON version:', data.version);
          }
          
          this.state.nodes.clear();
          if (Array.isArray(data.nodes)) {
              data.nodes.forEach((n: any) => this.state.nodes.set(n.id, n));
          }

          this.state.edges.clear();
          if (Array.isArray(data.edges)) {
              data.edges.forEach((e: any) => this.state.edges.set(e.id, e));
          }

          if (data.viewport) {
              this.state.viewport = data.viewport;
          }

          this.notify();
          this.onNodesChange?.(Array.from(this.state.nodes.values()));
          this.onEdgesChange?.(Array.from(this.state.edges.values()));
          this.saveSnapshot();
      } catch (err) {
          console.error('Failed to parse SciFlow JSON', err);
      }
  }
}
