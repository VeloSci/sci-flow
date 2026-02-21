import { FlowState } from '../types';

export interface RendererOptions {
  container: HTMLElement;
}

export abstract class BaseRenderer {
  protected container: HTMLElement;

  constructor(options: RendererOptions) {
    this.container = options.container;
  }

  public abstract render(state: FlowState, registry: Map<string, any>): void;
  public abstract destroy(): void;
  public abstract getViewportElement(): HTMLElement | SVGElement;
}
