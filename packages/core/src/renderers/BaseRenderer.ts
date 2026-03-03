import { FlowState, Theme } from '../types';
import { StateManager } from '../state/StateManager';
import { NodeDefinition } from '../state/RegistryManager';

export interface RendererOptions {
  container: HTMLElement;
}

export abstract class BaseRenderer {
  protected container: HTMLElement;
  public stateManager?: StateManager;

  constructor(options: RendererOptions) {
    this.container = options.container;
  }

  public abstract render(state: FlowState, registry: Map<string, NodeDefinition>, theme: Theme, dirty?: { nodes: boolean; edges: boolean; viewport: boolean }): void;
  public abstract destroy(): void;
  public abstract getViewportElement(): HTMLElement | SVGElement;
}
