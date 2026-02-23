# Smart Routing Example

`sci-flow` features an intelligent pathfinding system that automatically routes edges around nodes and other obstacles. This is particularly useful for complex diagrams where direct lines would overlap with node content.

<InteractiveFlow 
  title="Obstacle Avoidance"
  :nodes="[
    { id: 'start', type: 'default', position: { x: 50, y: 150 }, data: { label: 'Signal Out' }, outputs: { out: { label: 'Out' } } },
    { id: 'block', type: 'default', position: { x: 250, y: 100 }, data: { label: 'Obstacle' }, style: { width: 150, height: 150 } },
    { id: 'end', type: 'default', position: { x: 500, y: 150 }, data: { label: 'Signal In' }, inputs: { in: { label: 'In' } } }
  ]"
  :edges="[
    { id: 'e1', source: 'start', sourceHandle: 'out', target: 'end', targetHandle: 'in', type: 'smart' }
  ]"
  height="400px"
/>

## How it works

The smart routing system uses a grid-based A-Star algorithm running in a background **Web Worker**. This ensures that complex pathfinding calculations never block the main UI thread.

### Enabling Smart Routing

To use intelligent routing, simply set the edge `type` to `smart`:

```json
{
  "id": "e1",
  "source": "start",
  "target": "end",
  "type": "smart" 
}
```

### Performance Optimization

- **Grid Resolution**: The algorithm uses a configurable grid (default: 10px) to calculate the path. A larger grid is faster but less precise.
- **Worker Threading**: Every `SciFlow` instance spawns its own worker to handle routing requests asynchronously.
- **Caching**: Calculated paths are cached and only invalidated when the related nodes move or the viewport changes significantly.

### Visibility Focus

Unlike standard Bezier curves, smart edges will:
1. Identify the bounding boxes of all nodes on the canvas.
2. Find the shortest path from source to target that doesn't intersect any bounding box.
3. Smooth the resulting path using a Catmull-Rom spline (optional) or right-angled steps.
