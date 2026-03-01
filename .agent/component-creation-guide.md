---
description: Guide on how to create custom Nodes and Edges in sci-flow for AI Agents
---
# AI SYSTEM INSTRUCTION: Component Creation Guide

**CRITICAL DIRECTIVE**: Follow these concrete steps verbatim when tasked with creating new Custom Nodes or Custom Edges within `sci-flow`.

---

## TASK A: Creating a Custom Node

A Custom Node is a visual block on the graph. It requires UI rendering and connection Handles.

### Step 1: Component Definition
A Node component receives props from the `StateManager` (read-only) and must declare connection points using the `<Handle>` component provided by the framework wrapper.

**Rules for Node Components:**
1. **Z-Index and Styling**: Do not fight the wrapper's absolute positioning. Render your inner content constraints.
2. **Handles**: You MUST include at least one `<Handle type="target">` (to receive connections) or `<Handle type="source">` (to emit connections).
3. **Data Modification**: Never mutate the `data` prop directly. Use framework dispatchers or native DOM callbacks that report back to the core engine.

**Reference Implementation (React):**
```tsx
import { Handle, Position } from '@sci-flow/react';

export function CustomServerNode({ id, data, selected }) {
  // `data` comes from the graph state definition. 
  // e.g. nodes = [{ id: '1', type: 'server', data: { status: 'online' } }]

  return (
    <div className={`sci-custom-node ${selected ? 'is-selected' : ''}`}>
      {/* 1. Target Handle (Top) */}
      <Handle type="target" position={Position.Top} id="in" />
      
      {/* 2. Content */}
      <div className="server-icon" data-status={data.status} />
      <span>{data.label || 'Server Node'}</span>

      {/* 3. Source Handle (Bottom) */}
      <Handle type="source" position={Position.Bottom} id="out" />
    </div>
  );
}
```

### Step 2: Register the Node
Map your string type to the component when initializing `<SciFlow>`:

```tsx
const nodeTypes = {
  server: CustomServerNode,
};
// Used as: <SciFlow nodes={nodes} nodeTypes={nodeTypes} />
```

---

## TASK B: Creating a Custom Edge

An Edge is a visual line connecting two nodes. It is ALWAYS part of the SVG layout.

### Step 1: Retrieve Edge Math
DO NOT write bezier algorithms manually. Use the math utilities provided by the wrapper (which point back to the core engine).

### Step 2: Render the SVG Nodes
Edges use the `<BaseEdge>` component or native `<path>` tags. Because this is rendered inside an `<svg>` context, using HTML like `<div>` here will crash or fail to render unless wrapped in a `<foreignObject>`.

**Reference Implementation (React):**
```tsx
import { BaseEdge, EdgeProps, getBezierPath } from '@sci-flow/react';

export function CustomPipelineEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps) {

  // 1. Calculate Path using core helper
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* 2. The main path (visible line) */}
      <BaseEdge 
         path={edgePath} 
         style={{ ...style, strokeWidth: 3, stroke: data.isError ? 'red' : 'green' }} 
      />
      
      {/* 3. Custom SVG Additions using the calculated label coordinates */}
      <circle cx={labelX} cy={labelY} r={8} fill="white" stroke="black" />
      <text x={labelX} y={labelY + 4} fontSize={10} textAnchor="middle">
        {data.metric || '0'}
      </text>
    </>
  );
}
```

### Step 3: Register the Edge
```tsx
const edgeTypes = {
  pipeline: CustomPipelineEdge,
};
// Used as: <SciFlow edges={edges} edgeTypes={edgeTypes} />
```
