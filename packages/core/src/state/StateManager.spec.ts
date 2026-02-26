import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StateManager } from './StateManager';
import { Node, Edge } from '../types';

describe('StateManager', () => {
  let manager: StateManager;

  const mockNode: Node = {
    id: 'n1',
    type: 'default',
    position: { x: 0, y: 0 },
    data: { label: 'Node 1' },
    inputs: {},
    outputs: {}
  };

  const mockNode2: Node = {
    id: 'n2',
    type: 'default',
    position: { x: 100, y: 100 },
    data: { label: 'Node 2' },
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
    manager = new StateManager();
  });

  it('should initialize with default state', () => {
    const state = manager.getState();
    expect(state.nodes.size).toBe(0);
    expect(state.edges.size).toBe(0);
    expect(state.viewport).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('should add a node and notify listeners', () => {
    const listener = vi.fn();
    const onNodesChange = vi.fn();
    
    manager.subscribe(listener);
    manager.onNodesChange = onNodesChange;

    manager.addNode(mockNode);

    const state = manager.getState();
    expect(state.nodes.size).toBe(1);
    expect(state.nodes.get('n1')).toEqual(mockNode);
    expect(listener).toHaveBeenCalledWith(state);
    expect(onNodesChange).toHaveBeenCalledWith([mockNode]);
  });

  it('should remove a node and notify listeners', () => {
    manager.setNodes([mockNode, mockNode2]);
    manager.setEdges([mockEdge]);
    
    const listener = vi.fn();
    const onNodesChange = vi.fn();
    const onEdgesChange = vi.fn();
    
    manager.subscribe(listener);
    manager.onNodesChange = onNodesChange;
    manager.onEdgesChange = onEdgesChange;

    manager.removeNode('n1');

    const state = manager.getState();
    expect(state.nodes.size).toBe(1);
    expect(state.nodes.get('n2')).toEqual(mockNode2);
    // Edge should be removed because it connects to removed node
    expect(state.edges.size).toBe(0);
    
    expect(listener).toHaveBeenCalled();
    expect(onNodesChange).toHaveBeenCalledWith([mockNode2]);
    expect(onEdgesChange).toHaveBeenCalledWith([]);
  });

  it('should set an array of nodes', () => {
    manager.setNodes([mockNode, mockNode2]);
    expect(manager.getState().nodes.size).toBe(2);
  });

  it('should add an edge and trigger onConnect', () => {
    const onConnect = vi.fn();
    manager.onConnect = onConnect;
    
    manager.addEdge(mockEdge);
    
    expect(manager.getState().edges.size).toBe(1);
    expect(manager.getState().edges.get('e1')).toEqual(mockEdge);
    expect(onConnect).toHaveBeenCalledWith({
      source: mockEdge.source,
      sourceHandle: mockEdge.sourceHandle,
      target: mockEdge.target,
      targetHandle: mockEdge.targetHandle
    });
  });

  it('should update node position', () => {
    const onNodesChange = vi.fn();
    manager.onNodesChange = onNodesChange;
    
    manager.addNode(mockNode);
    manager.updateNodePosition('n1', 50, 50);
    
    const updated = manager.getState().nodes.get('n1');
    expect(updated?.position).toEqual({ x: 50, y: 50 });
    // Since it's not silent, it should trigger onNodesChange
    expect(onNodesChange).toHaveBeenCalledTimes(2); // one for addNode, one for updateNodePosition
  });

  it('should update node position silently', () => {
    const onNodesChange = vi.fn();
    manager.onNodesChange = onNodesChange;
    
    manager.addNode(mockNode);
    manager.updateNodePosition('n1', 50, 50, true); // Silent
    
    const updated = manager.getState().nodes.get('n1');
    expect(updated?.position).toEqual({ x: 50, y: 50 });
    // Should only be called once by addNode, not by silent update
    expect(onNodesChange).toHaveBeenCalledTimes(1);
  });
});
