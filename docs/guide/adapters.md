---
layout: doc
title: Framework Adapters
---

# Framework Adapters

All features are available through both React hooks and Vue composables with identical APIs.

## React Hooks

```bash
npm install @sci-flow/react
```

### usePlugins
```tsx
import { usePlugins } from '@sci-flow/react';

const plugins = usePlugins(engine);
plugins?.animation.animateNodePositions(targets, 500);
```

### useExport
```tsx
import { useExport } from '@sci-flow/react';

const { downloadPNG, downloadSVG, downloadJSON } = useExport(engine);
<button onClick={() => downloadPNG('my-flow')}>Export PNG</button>
```

### useAnimation
```tsx
import { useAnimation } from '@sci-flow/react';

const { animateNodes, animateViewport, easings } = useAnimation(engine);
await animateNodes(targets, 400, easings.spring);
```

### useDrop
```tsx
import { useDrop } from '@sci-flow/react';

const { onDragStart } = useDrop(engine);
<div draggable onDragStart={onDragStart({ type: 'processor', title: 'Filter' })}>
  Drag me onto the canvas
</div>
```

### useCollapse
```tsx
import { useCollapse } from '@sci-flow/react';

const { toggle, isCollapsed } = useCollapse(engine);
<button onClick={() => toggle('node-1')}>
  {isCollapsed('node-1') ? 'Expand' : 'Collapse'}
</button>
```

### useEvaluation
```tsx
import { useEvaluation } from '@sci-flow/react';

const { evaluate } = useEvaluation(engine);
const results = evaluate();
```

### useValidation
```tsx
import { useValidation } from '@sci-flow/react';

const { addCycleCheck, getComposed } = useValidation(engine);
addCycleCheck();
const validator = getComposed();
```

### useNodeToolbar
```tsx
import { useNodeToolbar } from '@sci-flow/react';

const { show, hide } = useNodeToolbar(engine, [
  { id: 'delete', label: 'Delete', icon: '🗑️', onClick: (id) => engine.removeNode(id) }
]);
```

---

## Vue Composables

```bash
npm install @sci-flow/vue
```

All composables mirror the React hooks exactly:

```vue
<script setup>
import { useExport, useAnimation, useDrop, useCollapse } from '@sci-flow/vue';

const { downloadPNG } = useExport(engine);
const { animateNodes } = useAnimation(engine);
const { toggle, isCollapsed } = useCollapse(engine);
const { onDragStart } = useDrop(engine);
</script>
```

### Available Composables

| Composable | Purpose |
|------------|---------|
| `usePlugins` | Access all plugins |
| `useExport` | Download PNG/SVG/JSON |
| `useAnimation` | Smooth transitions |
| `useDrop` | External drag & drop |
| `useCollapse` | Expand/collapse subtrees |
| `useEvaluation` | Graph pipeline execution |
| `useNodeToolbar` | Floating node actions |
| `useValidation` | Connection validators |
