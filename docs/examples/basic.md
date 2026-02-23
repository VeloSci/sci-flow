# Basic Flow Example

This example demonstrates the simplest configuration of `sci-flow` with a few nodes and a single edge.

<InteractiveFlow 
  title="Simple Connection"
  :nodes="[
    { id: 'n1', type: 'default', position: { x: 50, y: 50 }, data: { label: 'Source' }, outputs: { out1: { label: 'Signal' } } },
    { id: 'n2', type: 'default', position: { x: 300, y: 150 }, data: { label: 'Target' }, inputs: { in1: { label: 'Input' } } }
  ]"
  :edges="[
    { id: 'e1', source: 'n1', sourceHandle: 'out1', target: 'n2', targetHandle: 'in1' }
  ]"
/>

## Implementation

```tsx
import { SciFlow } from '@sci-flow/react';

const initialNodes = [
  { 
    id: 'n1', 
    type: 'default', 
    position: { x: 50, y: 50 },
    data: { label: 'Source' },
    outputs: { out1: { label: 'Signal' } }
  },
  { 
    id: 'n2', 
    type: 'default', 
    position: { x: 400, y: 150 },
    data: { label: 'Target' },
    inputs: { in1: { label: 'Input' } }
  }
];

const initialEdges = [
  {
    id: 'e1',
    source: 'n1',
    sourceHandle: 'out1',
    target: 'n2',
    targetHandle: 'in1'
  }
];

export default function BasicFlow() {
  return (
    <div style={{ height: '500px', border: '1px solid #ccc' }}>
      <SciFlow 
        initialNodes={initialNodes} 
        initialEdges={initialEdges} 
      />
    </div>
  );
}
```

## What's happening?

1. **`initialNodes`**: We define two nodes. Note the `inputs` and `outputs` objects which define the ports.
2. **`initialEdges`**: We link the output `out1` of node 1 to the input `in1` of node 2.
3. **`SciFlow` Component**: We pass these arrays to the component. The engine automatically calculates the initial viewport to fit these nodes if no viewport is provided.
