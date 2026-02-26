import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HistoryManager } from './HistoryManager';
import { FlowState, Node } from '../types';

describe('HistoryManager', () => {
  let manager: HistoryManager;

  const mockState1: FlowState = {
    nodes: new Map(),
    edges: new Map(),
    viewport: { x: 0, y: 0, zoom: 1 },
    direction: 'horizontal',
    defaultEdgeType: 'bezier',
    defaultEdgeStyle: { lineStyle: 'solid' }
  };

  const mockNode: Node = {
    id: 'n1',
    type: 'default',
    position: { x: 0, y: 0 },
    data: {},
    inputs: {},
    outputs: {}
  };

  const mockState2: FlowState = {
    nodes: new Map([['n1', mockNode]]),
    edges: new Map(),
    viewport: { x: 0, y: 0, zoom: 1 },
    direction: 'horizontal',
    defaultEdgeType: 'bezier',
    defaultEdgeStyle: { lineStyle: 'solid' }
  };

  beforeEach(() => {
    manager = new HistoryManager();
  });

  it('should save snapshots and increment index', () => {
    manager.saveSnapshot(mockState1);
    manager.saveSnapshot(mockState2);

    // After two saves, index should be 1, total 2
    expect(manager.serialize().length).toBe(2);
  });

  it('should ignore duplicate sequential snapshots', () => {
    manager.saveSnapshot(mockState1);
    manager.saveSnapshot(mockState1);

    expect(manager.serialize().length).toBe(1);
  });

  it('should call action listeners on save', () => {
    const listener = vi.fn();
    manager.onAction(listener);

    manager.saveSnapshot(mockState1);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should undo and redo correctly and call restore function', () => {
    const restoreFn = vi.fn();

    manager.saveSnapshot(mockState1);
    manager.saveSnapshot(mockState2);

    expect(manager.serialize().length).toBe(2);

    manager.undo(restoreFn);
    
    // The restore function receives the snapshot string payload representing mockState1
    expect(restoreFn).toHaveBeenCalledTimes(1);
    const restoredJSONStr = restoreFn.mock.calls[0][0];
    const restoredJSON = JSON.parse(restoredJSONStr);
    expect(restoredJSON.nodes).toHaveLength(0);

    manager.redo(restoreFn);
    
    // The restore function receives the snapshot string payload representing mockState2
    expect(restoreFn).toHaveBeenCalledTimes(2);
    const redoneJSONStr = restoreFn.mock.calls[1][0];
    const redoneJSON = JSON.parse(redoneJSONStr);
    expect(redoneJSON.nodes).toHaveLength(1);
  });
});
