---
description: Master guide on building interactive Nodes and SVG Edges
---
# Custom Nodes & Edges Architecture

`sci-flow` treats Nodes as standard HTML elements absolutely positioned by a wrapping translation component, and Edges as SVG paths drawn in a single unified background layer.

## Custom Nodes
Nodes are registered by mapping a string identifier to a Framework Component.

```tsx
import { MathNode } from './components/MathNode';
const nodeTypes = { math: MathNode };

// Inside the component:
export function MathNode({ data, isConnectable }) {
    return (
       <div className="custom-node-wrapper">
          {/* Handles dictate where edges connect physically */}
          <Handle type="target" position="top" />
          <div>{data.equation}</div>
          <Handle type="source" position="bottom" />
       </div>
    );
}
```
**Constraint**: NEVER map `.nodeTypes` dynamically inside the render loop (like `const nodeTypes = { custom: ... }` inside `App()`). It will cause unmounting every frame. Memoize or declared outside.

## Custom Edges
Unlike Nodes, Edges are strictly SVG fragments.

1. You receive coordinates `sourceX`, `sourceY`, `targetX`, `targetY`.
2. You pass them to routing math like `getBezierPath()` or `getSmoothStepPath()`.
3. You render a `<path>` or `<BaseEdge>`.

```tsx
// Inside edgeTypes mapping:
export function RainbowEdge({ sourceX, sourceY, targetX, targetY }) {
   const [path] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY });
   return <BaseEdge path={path} style={{ stroke: 'url(#rainbowGrad)' }} /> // Needs gradient def
}
```
