# React API Reference

The `@sci-flow/react` package provides a high-level wrapper and hooks to integrate the flow engine into React applications.

## Component: `<SciFlow />`

The main component to render the flow.

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `initialNodes` | `Node[]` | `[]` | Initial node set. |
| `initialEdges` | `Edge[]` | `[]` | Initial edge set. |
| `nodeTypes` | `React.FC<any>[]` | `[]` | Custom React components for nodes. |
| `theme` | `'light' \| 'dark'` | `'light'` | UI theme. |
| `onInit` | `(engine: SciFlow) => void` | - | Callback when internal engine is ready. |

## Hook: `useSciFlow`

A low-level hook to manage the engine state directly from your components.

```tsx
const { 
  nodes, 
  edges, 
  setNodes, 
  setEdges, 
  fitView 
} = useSciFlow({ initialNodes, initialEdges });
```

### Returns

- `nodes`: Current array of nodes.
- `edges`: Current array of edges.
- `setNodes`: Function to update nodes.
- `setEdges`: Function to update edges.
- `fitView`: Helper to center the graph.
- `engine`: The raw `SciFlow` instance for advanced usage.

## Custom Nodes

Custom nodes in React are simple functional components. They receive the `node` data as a prop.

```tsx
import { NodeProps } from '@sci-flow/react';

export const MyCustomNode = ({ node }: NodeProps) => {
  return (
    <div className="my-node">
      <h3>{node.data.label}</h3>
      <p>ID: {node.id}</p>
    </div>
  );
};
```

Register it in the `SciFlow` component:

```tsx
<SciFlow nodeTypes={[MyCustomNode]} />
```
