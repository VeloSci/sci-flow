// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SciFlow } from './SciFlow';
import { Node, Edge } from '../types';

describe('SciFlow (Engine)', () => {
  let container: HTMLDivElement;
  let engine: SciFlow;

  const mockNode: Node = {
    id: 'n1',
    type: 'default',
    position: { x: 0, y: 0 },
    data: { label: 'Node 1' },
    inputs: {},
    outputs: {}
  };

  const mockEdge: Edge = {
    id: 'e1',
    source: 'n1',
    target: 'n2',
    sourceHandle: 'out',
    targetHandle: 'in'
  };

  beforeEach(() => {
    // Mock URL, Worker, and ResizeObserver for JSDOM
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    global.Worker = vi.fn().mockImplementation(() => ({
      postMessage: vi.fn(),
      terminate: vi.fn(),
      onmessage: null,
      onerror: null
    })) as any;
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    container = document.createElement('div');
    // Set some dimensions so it thinks it has a size
    Object.defineProperty(container, 'clientWidth', { value: 800 });
    Object.defineProperty(container, 'clientHeight', { value: 600 });
    
    engine = new SciFlow({ container });
  });

  afterEach(() => {
    engine.destroy();
  });

  it('should initialize and create managers', () => {
    expect(engine.stateManager).toBeDefined();
    expect(engine.plugins).toBeDefined();
  });

  it('should add nodes and edges through proxy methods', () => {
    engine.addNode(mockNode);
    engine.addEdge(mockEdge);

    const state = engine.getState();
    expect(state.nodes.size).toBe(1);
    expect(state.nodes.get('n1')).toEqual(mockNode);

    expect(state.edges.size).toBe(1);
    expect(state.edges.get('e1')).toEqual(mockEdge);
  });

  it('should remove node and its adjoined edges', () => {
    engine.addNode(mockNode);
    engine.addEdge(mockEdge);
    
    engine.removeNode('n1');

    const state = engine.getState();
    expect(state.nodes.size).toBe(0);
    expect(state.edges.size).toBe(0); // Removing n1 should remove e1 as well
  });

  it('should update node positions', () => {
    engine.addNode(mockNode);
    engine.updateNodePosition('n1', 200, 300);

    const updatedNode = engine.getState().nodes.get('n1');
    expect(updatedNode?.position).toEqual({ x: 200, y: 300 });
  });

  it('should serialize to JSON correctly', () => {
    engine.addNode(mockNode);
    engine.addEdge(mockEdge);

    const json = engine.toJSON();
    const parsed = JSON.parse(json);

    expect(parsed.nodes).toHaveLength(1);
    expect(parsed.edges).toHaveLength(1);
    expect(parsed.nodes[0].id).toBe('n1');
    expect(parsed.edges[0].id).toBe('e1');
  });

  it('should load from JSON state correctly', () => {
    const rawState = {
      nodes: [mockNode],
      edges: [mockEdge],
      viewport: { x: 10, y: 20, zoom: 1.5 },
      direction: 'vertical'
    };

    engine.fromJSON(JSON.stringify(rawState));

    const state = engine.getState();
    expect(state.nodes.size).toBe(1);
    expect(state.edges.size).toBe(1);
    expect(state.viewport).toEqual({ x: 10, y: 20, zoom: 1.5 });
    expect(state.direction).toBe('vertical');
  });

  it('should fitView without throwing', () => {
    engine.addNode(mockNode);
    // JS dom won't really have proper bounding coords, but we just verify it doesn't crash
    expect(() => engine.fitView()).not.toThrow();
  });
});
