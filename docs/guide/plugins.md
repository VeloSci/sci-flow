---
layout: doc
title: Plugins
---

# Plugin System

All new features are accessible via `engine.plugins.*`. The `PluginHost` is instantiated automatically.

## Available Plugins

### Animation

Smooth transitions for node positions and viewport:

```typescript
// Animate nodes to new positions
const targets = new Map([
  ['node-1', { x: 100, y: 100 }],
  ['node-2', { x: 300, y: 200 }],
]);
await engine.plugins.animation.animateNodePositions(targets, 500);

// Animate viewport
await engine.plugins.animation.animateViewport({ x: 0, y: 0, zoom: 1 }, 300);
```

### Export

Download the graph as PNG, SVG, or JSON:

```typescript
await engine.plugins.exporter.download('my-flow', 'png');
await engine.plugins.exporter.download('my-flow', 'svg');
const svgString = engine.plugins.exporter.toSVG();
const blob = await engine.plugins.exporter.toPNG(2); // 2x scale
```

### Collision Detection

Prevent node overlap during drag:

```typescript
engine.plugins.collision.mode = 'push';  // Push other nodes away
engine.plugins.collision.mode = 'block'; // Prevent overlap entirely
engine.plugins.collision.mode = 'none';  // No collision detection

// Get all overlapping pairs
const pairs = engine.plugins.collision.getOverlappingPairs();
```

### Level of Detail (LOD)

Simplify rendering at low zoom levels:

```typescript
engine.plugins.lod.getLevel(); // 'full' | 'simplified' | 'dot'

engine.plugins.lod.setThresholds({
  dotThreshold: 0.2,        // Below 0.2x → dots only
  simplifiedThreshold: 0.5  // Below 0.5x → hide bodies
});

engine.plugins.lod.onLevelChange((level) => {
  console.log('LOD changed to:', level);
});
```

### Graph Evaluation

Execute the graph as a data pipeline:

```typescript
const results = engine.plugins.evaluation.evaluate();
// Returns Map<nodeId, outputs>
results.forEach((outputs, nodeId) => {
  console.log(`${nodeId}:`, outputs);
});
```

### Collapse/Expand

Hide/show subtrees:

```typescript
engine.plugins.collapse.toggle('node-1');
engine.plugins.collapse.isCollapsed('node-1'); // true
engine.plugins.collapse.expand('node-1');
```

### Node Toolbar

Show floating toolbar on selected nodes:

```typescript
engine.plugins.toolbar.setActions([
  { id: 'delete', label: 'Delete', icon: '🗑️', onClick: (id) => engine.removeNode(id) },
  { id: 'duplicate', label: 'Duplicate', icon: '📋', onClick: (id) => { /* ... */ } },
]);
engine.plugins.toolbar.show('node-1');
```

### Edge Labels

Automatically rendered at edge midpoints when `edge.data.label` is set:

```typescript
const edge = { id: 'e1', source: 'a', target: 'b',
  sourceHandle: 'out', targetHandle: 'in',
  data: { label: 'Data Flow' }
};
```

### External Drag & Drop

Drop new nodes from external panels:

```typescript
// Set the data transfer in your drag source:
e.dataTransfer.setData('application/sci-flow-node', JSON.stringify({
  type: 'processor',
  title: 'New Filter',
  inputs: { in1: { dataType: 'number', label: 'Input' } },
  outputs: { out1: { dataType: 'number', label: 'Output' } }
}));
```
