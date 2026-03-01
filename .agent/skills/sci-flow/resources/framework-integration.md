---
description: Understanding the monorepo architecture and framework wrappers
---
# Framework Integration Guide

`sci-flow` is designed around a "Core Engine" model. 
- `@sci-flow/core` holds the ZoomPan store (D3-zoom based), the Edge router math, the EventBus, and the Selection handlers. It is totally UI agnostic.
- `@sci-flow/react`, `vue`, and `svelte` act solely as reactive bindings that take the engine state and convert it to template loops.

## State Mutators
Because the framework wrappers synchronize with the core engine, you can read layout changes but shouldn't override the drag event logic.

For example, when a user drags a node in React, the `useNodesState` hook fires the `onNodesChange` callback. This callback receives a complex "Change Payload" (type: `NodeChange[]`) rather than simply the new `x, y` directly. You must forward this payload to `applyNodeChanges(changes, nodes)` which returns the mathematically correct updated array.

```tsx
import { applyNodeChanges, applyEdgeChanges } from '@sci-flow/core';

// Typical hook implementation
const onNodesChange = (changes) => setNodes((nds) => applyNodeChanges(changes, nds));
```

## CSS Isolation
The core package exports `styles.css` containing `pointer-events: none` on specific layers preventing you from accidentally clicking the background svg instead of the nodes. If you forget this import in your framework bootstrap, the chart will be un-interactive.
