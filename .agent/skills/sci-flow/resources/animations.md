---
description: Guide on configuring built-in SVG edge animations in sci-flow
---
# Edge Animations in sci-flow

`sci-flow` core provides hardware-accelerated animated edges using native SVG `<animate>` and `stroke-dashoffset` tricks. These run entirely independently of the JavaScript main thread.

## Supported Types
When declaring an edge in the state array, set the `type` property or use the generic `animated: true`.

1. **`default` (animated=true)**: A simple moving dash array indicating flow direction.
2. **`radar`**: Nodes scanning pulse traversing the line.
3. **`spin-x`**: Rotating indicators crossing the path length.
4. **`sine-orbit`**: Oscillating particles along the edge.
5. **`arrows`**: Repeated animated directional arrows.

## Usage
```typescript
const edges = [
  { id: 'e1', source: 'A', target: 'B', animated: true },                 // Dash array logic
  { id: 'e2', source: 'C', target: 'D', type: 'radar', animated: true },  // Radar pulse
];
```

## Creating Custom Animations
To create a custom animation, do NOT use `requestAnimationFrame`. Instead, create a custom Edge Component and inject an `<animateTransform>` or `<animateMotion>` tag into the SVG path.

```tsx
<path d={edgePath} fill="none" stroke="#222">
   <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
</path>
```
