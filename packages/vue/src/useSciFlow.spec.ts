// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/vue';
import { defineComponent } from 'vue';
import { useSciFlow } from './useSciFlow';
import { SciFlow } from '@sci-flow/core';

describe('useSciFlow composable', () => {

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
    let internalEngine: SciFlow | null = null;
    let initialized = false;

    const TestComponent = defineComponent({
      setup() {
        const { containerRef, nodes, edges } = useSciFlow({
          initialNodes: [{ id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' }, type: 'default', inputs: {}, outputs: {} }],
          initialEdges: [{ id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'out', targetHandle: 'in' }],
          onInit(engineInst) {
            internalEngine = engineInst;
            initialized = true;
          }
        });

        // The engine value is exposed directly in Vue via .value 
        // We capture it when onMounted completes but the robust way is onInit hook
        return { containerRef, nodes, edges };
      },
      template: `
        <div data-testid="sciflow-container" ref="containerRef">
          <div data-testid="nodes-count">{{ nodes.length }}</div>
          <div data-testid="edges-count">{{ edges.length }}</div>
        </div>
      `
    });

    render(TestComponent);

    const container = screen.getByTestId('sciflow-container');
    expect(container).toBeDefined();

    expect(initialized).toBe(true);
    expect(internalEngine).not.toBeNull();
    if (internalEngine) {
      const eng = internalEngine as SciFlow;
      expect(eng.stateManager).toBeDefined();

      const state = eng.getState();
      expect(state?.nodes.size).toBe(1);
      expect(state?.edges.size).toBe(1);
    }
  });
});
