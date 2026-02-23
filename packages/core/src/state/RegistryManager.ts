import { Node } from '../types';

export interface NodeDefinition {
  type: string;
  renderHTML?: (node: Node) => HTMLElement;
  renderCanvas?: (ctx: CanvasRenderingContext2D, node: Node) => void;
  defaultStyle?: Partial<Node['style']>;
  evaluate?: (inputs: Record<string, any>, nodeData: any) => Record<string, any>;
}

export class RegistryManager {
  private registry: Map<string, NodeDefinition> = new Map();

  public register(definition: NodeDefinition) {
    this.registry.set(definition.type, definition);
  }

  public get(type: string): NodeDefinition | undefined {
    return this.registry.get(type);
  }

  public getAllTypes(): string[] {
    return Array.from(this.registry.keys());
  }

  public getFullRegistry(): Map<string, NodeDefinition> {
    return this.registry;
  }
}
