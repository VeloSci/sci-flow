import { FlowState, Node, Edge, ViewportState, Position, Connection, OnNodeContextMenu, OnEdgeContextMenu, OnPaneContextMenu } from '../types';
import { HistoryManager } from './HistoryManager';
import { RegistryManager, NodeDefinition } from './RegistryManager';

type Listener = (state: FlowState) => void;

export class StateManager {
  private state: FlowState;
  private listeners: Set<Listener> = new Set();
  public readonly id: string;
  private history = new HistoryManager();
  private registry = new RegistryManager();

  public onNodesChange?: (nodes: Node[]) => void;
  public onEdgesChange?: (edges: Edge[]) => void;
  public onConnect?: (connection: Connection) => void;
  public onNodeMount?: (nodeId: string, container: HTMLElement) => void;
  public onNodeUnmount?: (nodeId: string) => void;
  
  public onNodeContextMenu?: OnNodeContextMenu;
  public onEdgeContextMenu?: OnEdgeContextMenu;
  public onPaneContextMenu?: OnPaneContextMenu;

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

  public registerNodeType(def: NodeDefinition) { this.registry.register(def); }
  public getNodeDefinition(type: string) { return this.registry.get(type); }
  public getRegisteredNodeTypes() { return this.registry.getAllTypes(); }
  public getNodeRegistry() { return this.registry.getFullRegistry(); }

  public getState() { return this.state; }
  public subscribe(l: Listener) { this.listeners.add(l); return () => this.listeners.delete(l); }
  private notify() { this.listeners.forEach(l => l(this.state)); }
  public forceUpdate() { this.notify(); }

  public setNodes(nodes: Node[]) {
    this.state.nodes.clear();
    nodes.forEach(n => this.state.nodes.set(n.id, n));
    this.notify();
    this.onNodesChange?.(Array.from(this.state.nodes.values()));
  }

  public setEdges(edges: Edge[]) {
    this.state.edges.clear();
    edges.forEach(e => this.state.edges.set(e.id, e));
    this.notify();
    this.onEdgesChange?.(Array.from(this.state.edges.values()));
  }

  public setSelection(nodeIds: string[], edgeIds: string[]) {
    this.state.nodes.forEach(n => n.selected = nodeIds.includes(n.id));
    this.state.edges.forEach(e => e.selected = edgeIds.includes(e.id));
    this.notify();
  }

  public appendSelection(nodeId?: string, edgeId?: string) {
    if (nodeId) {
        const node = this.state.nodes.get(nodeId);
        if (node) node.selected = true;
    }
    if (edgeId) {
        const edge = this.state.edges.get(edgeId);
        if (edge) edge.selected = true;
    }
    this.notify();
  }

  public addNode(node: Node) { 
    this.state.nodes.set(node.id, node); 
    this.notify(); 
    this.onNodesChange?.(Array.from(this.state.nodes.values()));
  }

  public setDraftEdge(sourceNodeId: string, sourcePortId: string, targetPosition: Position) {
    this.state.draftEdge = { sourceNodeId, sourcePortId, targetPosition };
    this.notify();
  }

  public clearDraftEdge() { this.state.draftEdge = undefined; this.notify(); }

  public removeNode(id: string) {
    const descendants = this.getDescendantsLocal([id]);
    const nodesToRemove = new Set([id, ...descendants]);

    for (const nodeId of nodesToRemove) {
      this.state.nodes.delete(nodeId);
      for (const [eid, edge] of this.state.edges.entries()) {
        if (edge.source === nodeId || edge.target === nodeId) {
          this.state.edges.delete(eid);
        }
      }
    }
    this.notify();
    this.saveSnapshot();
    this.onNodesChange?.(Array.from(this.state.nodes.values()));
    this.onEdgesChange?.(Array.from(this.state.edges.values()));
  }

  private getDescendantsLocal(parentIds: string[]): string[] {
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

  public updateNodePosition(id: string, x: number, y: number, silent = false) {
    const node = this.state.nodes.get(id);
    if (node) {
      node.position = { x, y };
      this.notify();
      if (!silent) this.onNodesChange?.(Array.from(this.state.nodes.values()));
    }
  }

  public addEdge(edge: Edge) {
    this.state.edges.set(edge.id, edge);
    this.notify();
    this.saveSnapshot();
    this.onEdgesChange?.(Array.from(this.state.edges.values()));
    this.onConnect?.({ source: edge.source, sourceHandle: edge.sourceHandle, target: edge.target, targetHandle: edge.targetHandle });
  }

  public removeEdge(id: string) {
    if (this.state.edges.delete(id)) {
      this.notify();
      this.saveSnapshot();
      this.onEdgesChange?.(Array.from(this.state.edges.values()));
    }
  }

  public saveSnapshot() { this.history.saveSnapshot(this.state); }
  public undo() { this.history.undo(s => this.restoreSnapshot(s)); }
  public redo() { this.history.redo(s => this.restoreSnapshot(s)); }

  private restoreSnapshot(snapshot: string) {
    const parsed = JSON.parse(snapshot);
    this.state.nodes = new Map(parsed.nodes);
    this.state.edges = new Map(parsed.edges);
    this.notify();
    this.onNodesChange?.(Array.from(this.state.nodes.values()));
    this.onEdgesChange?.(Array.from(this.state.edges.values()));
  }

  public setDefaultEdgeType(type: 'straight' | 'bezier' | 'step' | 'smart') {
    this.state.defaultEdgeType = type;
    this.notify();
  }

  public setDefaultEdgeStyle(style: Partial<Edge['style']>) {
    this.state.defaultEdgeStyle = { ...this.state.defaultEdgeStyle, ...style };
    this.notify();
  }

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
      this.state.nodes.clear();
      if (Array.isArray(data.nodes)) data.nodes.forEach((n: Node) => this.state.nodes.set(n.id, n));
      this.state.edges.clear();
      if (Array.isArray(data.edges)) data.edges.forEach((e: Edge) => this.state.edges.set(e.id, e));
      if (data.viewport) this.state.viewport = data.viewport;
      this.notify();
      this.onNodesChange?.(Array.from(this.state.nodes.values()));
      this.onEdgesChange?.(Array.from(this.state.edges.values()));
      this.saveSnapshot();
    } catch (err) { console.error('Failed to parse SciFlow JSON', err); }
  }

  public setViewport(v: ViewportState) { this.state.viewport = v; this.notify(); }

  // --- Smart Guides ---
  public setSmartGuides(guides?: { x?: number, y?: number }[]) {
    this.state.smartGuides = guides;
    this.notify();
  }

  public clearSmartGuides() {
    this.state.smartGuides = undefined;
    this.notify();
  }

  public commitNodePositions() {
    this.onNodesChange?.(Array.from(this.state.nodes.values()));
  }
}
