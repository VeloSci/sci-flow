// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import SciFlow from './SciFlow.svelte';

describe('SciFlow.svelte Component', () => {
  beforeEach(() => {
    // Mock URL and Worker for JSDOM 
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

  it('should render the container', () => {
    const { container } = render(SciFlow, {
      props: {
        initialNodes: [],
        initialEdges: []
      }
    });
    const div = container.querySelector('.sci-flow-svelte-container');
    expect(div).toBeDefined();
    expect(div).not.toBeNull();
  });
});
