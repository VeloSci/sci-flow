# Core API Reference

The core API consists of the main `SciFlow` class and the base types used across the library.

## `SciFlow` Class

### Constructor
`new SciFlow(options: SciFlowOptions)`

| Argument | Type | Description |
| --- | --- | --- |
| `options.container` | `HTMLElement` | The parent DOM element. |
| `options.initialNodes` | `Node[]` | (Optional) Nodes to load on start. |
| `options.initialEdges` | `Edge[]` | (Optional) Edges to load on start. |

### Node Methods

#### `addNode(node: Node): void`
Adds a single node to the flow.

#### `removeNode(id: string): void`
Removes a node and all connected edges.

#### `setNodes(nodes: Node[]): void`
Replaces all current nodes.

#### `updateNode(id: string, data: Partial<Node>): void`
Merges the given data into an existing node.

### Edge Methods

#### `addEdge(edge: Edge): void`
Adds a single edge.

#### `removeEdge(id: string): void`
Removes an edge.

#### `setEdges(edges: Edge[]): void`
Replaces all current edges.

### Viewport Methods

#### `fitView(padding?: number): void`
Adjusts zoom and pan to fit all nodes in the container.

#### `zoomTo(level: number): void`
Sets the exact zoom level.

#### `centerNode(id: string): void`
Pans the viewport to focus on a specific node.

## Base Types

### `Node`
```typescript
interface Node {
  id: string;
  type: string;
  position: { x: number, y: number };
  data: any;
  inputs?: Record<string, Port>;
  outputs?: Record<string, Port>;
  style?: { width?: number, height?: number };
}
```

### `Edge`
```typescript
interface Edge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
  label?: string;
  type?: 'bezier' | 'straight' | 'step' | 'smart';
}
```
