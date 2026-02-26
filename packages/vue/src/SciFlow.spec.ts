// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/vue';
import SciFlow from './SciFlow.vue';

describe('SciFlow.vue Component', () => {

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
    const { container } = render(SciFlow);
    const div = container.querySelector('.sci-flow-vue-container');
    expect(div).toBeDefined();
    expect(div).not.toBeNull();
  });

  it('should correctly render default slot content', () => {
    render(SciFlow, {
      slots: {
        default: '<div data-testid="child-element">Overlay</div>'
      }
    });

    expect(screen.getByTestId('child-element')).toBeDefined();
    expect(screen.getByText('Overlay')).toBeDefined();
  });
});
