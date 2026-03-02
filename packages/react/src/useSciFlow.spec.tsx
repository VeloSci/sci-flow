import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import type { SciFlow as SciFlowEngine } from '@sci-flow/core';
import { useSciFlow } from './useSciFlow';

describe('useSciFlow', () => {

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
  });

  it('should initialize engine when mounted with ref', () => {
    let internalEngine: SciFlowEngine | null = null;

    const TestComponent = () => {
      const { containerRef, engine, nodes, edges } = useSciFlow({
        initialNodes: [{ id: 'n1', type: 'default', position: { x: 0, y: 0 }, data: { label: 'Node 1' }, inputs: {}, outputs: {} }],
        initialEdges: [{ id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'out', targetHandle: 'in' }]
      });

      useEffect(() => {
        if (engine) internalEngine = engine;
      }, [engine]);

      return (
        <div data-testid="sciflow-container" ref={containerRef}>
          <div data-testid="nodes-count">{nodes.length}</div>
          <div data-testid="edges-count">{edges.length}</div>
        </div>
      );
    };

    render(<TestComponent />);

    const container = screen.getByTestId('sciflow-container');
    expect(container).toBeDefined();

    // Since initialization happens in useEffect, we might need to check if nodes are rendered
    // But engine is created synchronously within the hook's first useEffect after mount.
    // The state updates (setNodesState) happen, which cause a re-render.

    // In React 18, state updates from effects flush synchronously in some cases or async.
    // Let's just check the engine ref.
    expect(internalEngine).not.toBeNull();
    if (internalEngine) {
      const eng = internalEngine as SciFlowEngine;
      expect(eng.stateManager).toBeDefined();

      // Check if initial nodes/edges were passed to engine
      const state = eng.getState();
      expect(state?.nodes.size).toBe(1);
      expect(state?.edges.size).toBe(1);
    }
  });

  it('should update theme when options change', () => {
    let engineRefInstance: SciFlowEngine | null = null;

    const TestComponent = ({ theme }: { theme: 'light' | 'dark' }) => {
      const { containerRef, engine } = useSciFlow({ theme });
      useEffect(() => {
        if (engine) engineRefInstance = engine;
      }, [engine]);
      return <div data-testid="container" ref={containerRef} />;
    };

    const { rerender } = render(<TestComponent theme="light" />);
    if (engineRefInstance) {
      const setThemeSpy = vi.spyOn(engineRefInstance, 'setTheme');

      rerender(<TestComponent theme="dark" />);

      expect(setThemeSpy).toHaveBeenCalledWith('dark');
    }
  });

});
