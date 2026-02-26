---
layout: doc
title: Export & Animation
---

# Export & Animation

## Exporting the Graph

Download your flow as PNG, SVG, or JSON:

```typescript
// Direct API
await engine.plugins.exporter.download('my-flow', 'png');  // Downloads PNG
await engine.plugins.exporter.download('my-flow', 'svg');  // Downloads SVG
await engine.plugins.exporter.download('my-flow', 'json'); // Downloads JSON

// Get raw data
const svgString = engine.plugins.exporter.toSVG();
const pngBlob = await engine.plugins.exporter.toPNG(2); // 2x scale
```

### React

```tsx
import { useExport } from '@sci-flow/react';

const { downloadPNG, downloadSVG, downloadJSON } = useExport(engine);
<button onClick={() => downloadPNG('my-flow')}>Export PNG</button>
```

---

## Node Position Animation

Smoothly animate nodes to new positions:

```typescript
const targets = new Map([
  ['node-1', { x: 100, y: 100 }],
  ['node-2', { x: 300, y: 200 }],
]);
await engine.plugins.animation.animateNodePositions(targets, 500);
```

### Viewport Animation

```typescript
await engine.plugins.animation.animateViewport(
  { x: 0, y: 0, zoom: 1 },
  300,
  easings.spring
);
```

### Easing Functions

```typescript
import { easings } from '@sci-flow/core';

easings.linear     // constant speed
easings.easeIn     // slow start
easings.easeOut    // slow end
easings.easeInOut  // slow start and end
easings.spring     // spring-like bounce
```

### Auto-Layout Animation

Animate all nodes into a grid:

```typescript
const state = engine.getState();
const targets = new Map();
let i = 0;
state.nodes.forEach((node) => {
  targets.set(node.id, { x: 100 + (i % 3) * 250, y: 100 + Math.floor(i / 3) * 200 });
  i++;
});
await engine.plugins.animation.animateNodePositions(targets, 600);
```

## Live Demo

<FeatureDemo component="ExportDemo" />

> **Try it!** Export as PNG, SVG, or JSON. Click **Animate Grid** to see smooth position animation.
