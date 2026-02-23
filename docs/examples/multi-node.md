# Multi-Node Flow Example

Handling multiple nodes and maintaining clear layouts is a core capability of `sci-flow`. This example shows a three-step processing pipeline.

<InteractiveFlow 
  title="3-Step Pipeline"
  :nodes="[
    { id: 'n1', type: 'default', position: { x: 50, y: 50 }, data: { label: 'Input A' }, outputs: { out: { label: 'Data' } } },
    { id: 'n2', type: 'default', position: { x: 50, y: 250 }, data: { label: 'Input B' }, outputs: { out: { label: 'Data' } } },
    { id: 'n3', type: 'default', position: { x: 300, y: 150 }, data: { label: 'Merge & Sort' }, inputs: { in1: { label: 'A' }, in2: { label: 'B' } }, outputs: { out: { label: 'Result' } } }
  ]"
  :edges="[
    { id: 'e1', source: 'n1', sourceHandle: 'out', target: 'n3', targetHandle: 'in1' },
    { id: 'e2', source: 'n2', sourceHandle: 'out', target: 'n3', targetHandle: 'in2' }
  ]"
  height="400px"
/>

## Implementation Details

When building multi-node layouts, consider the following:

### 1. Coordinate System
`sci-flow` uses a standard 2D coordinate system where `(0,0)` is the top-left corner of the flow container. Positions are defined in absolute units.

### 2. Port Fan-In/Fan-Out
Nodes like the "Merge & Sort" node in this example use multiple input ports. You can define as many ports as needed in the `inputs` and `outputs` properties of the node data.

```typescript
const mergeNode = {
  id: 'n3',
  inputs: {
    in1: { label: 'A' },
    in2: { label: 'B' }
  },
  // ...
}
```

### 3. Edge Routing
By default, edges will use smooth Bezier curves. If nodes are closely packed, you might want to switch to `step` or `straight` routing to avoid visual clutter.

```json
{
  "id": "e1",
  "source": "n1",
  "target": "n3",
  "type": "step"
}
```
