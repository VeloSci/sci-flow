import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SciFlow } from './SciFlow';

describe('SciFlow Component', () => {

  beforeEach(() => {
    // Mock URL and Worker for JSDOM
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    global.Worker = vi.fn().mockImplementation(() => ({
      postMessage: vi.fn(),
      terminate: vi.fn(),
    })) as any;
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  it('should render the container and pass through className and style', () => {
    const { container } = render(
      <SciFlow className="test-class" style={{ background: 'red' }} />
    );

    const div = container.firstChild as HTMLDivElement;
    expect(div).toBeDefined();
    expect(div.className).toContain('sci-flow-react-container');
    expect(div.className).toContain('test-class');
    expect(div.style.background).toBe('red');
  });

  it('should correctly render children elements', () => {
    render(
      <SciFlow>
        <div data-testid="child-element">Overlay</div>
      </SciFlow>
    );

    expect(screen.getByTestId('child-element')).toBeDefined();
    expect(screen.getByText('Overlay')).toBeDefined();
  });
});
