---
layout: doc
title: Drag & Drop
---

# Drag & Drop Nodes

Drop new nodes from an external palette onto the canvas.

## Setup

The `DropManager` listens for HTML5 drag events on the canvas container. Any element with `draggable` can serialize node data into the drop event.

## Drag Source

```html
<div draggable onDragStart={(e) => {
  e.dataTransfer.setData('application/sci-flow-node', JSON.stringify({
    type: 'processor',
    title: 'Filter',
    inputs: { in1: { dataType: 'number', label: 'Input' } },
    outputs: { out1: { dataType: 'number', label: 'Output' } }
  }));
  e.dataTransfer.effectAllowed = 'move';
}}>
  🔧 Filter Node
</div>
```

## React Hook

```tsx
import { useDrop } from '@sci-flow/react';

const { onDragStart } = useDrop(engine);

<div draggable onDragStart={onDragStart({
  type: 'processor', title: 'Filter',
  inputs: { in1: { dataType: 'number', label: 'In' } },
  outputs: { out1: { dataType: 'number', label: 'Out' } }
})}>
  Filter Node
</div>
```

## Custom Drop Handler

```typescript
engine.plugins.drop.setOnDrop((position, data) => {
  engine.addNode({
    id: `node-${Date.now()}`,
    type: data.type,
    position,
    data: { title: data.title },
    inputs: { /* ... */ },
    outputs: { /* ... */ },
  });
});
```

## Live Demo

<FeatureDemo component="DragDropDemo" />

> **Try it!** Drag any node type from the palette bar onto the canvas. Connect them by dragging between ports.
