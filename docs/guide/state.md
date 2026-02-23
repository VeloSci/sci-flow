# State Management

`sci-flow` uses a centralized, observable state managed by the `StateManager`. This ensures that all components (renderer, grid, interaction manager) stay in sync.

## The FlowState

The entire graph state is held in a single object:

<InteractiveFlow 
  title="State Visualization"
  :nodes="[
    { id: 'sn1', type: 'default', position: { x: 50, y: 50 }, data: { label: 'Active Node' } }
  ]"
  :edges="[]"
  height="150px"
/>

```typescript
export interface FlowState {
  nodes: Map<string, Node>;
  edges: Map<string, Edge>;
  viewport: { x: number, y: number, zoom: number };
  // ... other internal states
}
```

## Observing Changes

You can subscribe to state changes to react to user interactions:

```typescript
const unsubscribe = engine.subscribe((state) => {
  console.log('State updated:', state);
});
```

## Manipulating State

The `SciFlow` class provides high-level methods to mutate the state safely:

- `addNode(node)`: Adds a new node.
- `removeNode(id)`: Removes a node and its associated edges.
- `setNodes(nodes)`: Overwrites the entire node set.
- `updateNodePosition(id, x, y)`: Moves a node.
- `fitView()`: Centers the viewport to show all nodes.

## Immutable Patterns

Internally, the `StateManager` uses atomic updates. When you call a state-modifying method, it triggers a "render loop" that notifies all listeners. In the React wrapper, this is automatically mapped to React state.
