# Vue API Reference

## Main Composable

### `useSciFlow(options)`
Returns `{ engine, nodes, edges, portals }`. Core composable to init and manage SciFlow.

## Components

### `<SciFlow>`
| Prop | Type | Description |
|------|------|-------------|
| `engine` | `ShallowRef<SciFlow>` | Engine instance |
| `nodes` | `Ref<Node[]>` | Current nodes |
| `edges` | `Ref<Edge[]>` | Current edges |

### `<SciFlowMiniMap>`
| Prop | Type | Description |
|------|------|-------------|
| `engine` | `ShallowRef<SciFlow>` | Engine instance |

## Feature Composables

| Composable | Description |
|------------|-------------|
| `usePlugins(engine)` | Access all plugin managers |
| `useExport(engine)` | `downloadPNG`, `downloadSVG`, `downloadJSON`, `toSVGString`, `toPNGBlob` |
| `useAnimation(engine)` | `animateNodes`, `setAnimation`, `stopAnimation` |
| `useDrop(engine)` | `onDrop`, `onDragOver` for external drag-and-drop |
| `useValidation(engine)` | `setValidator`, `validateConnection` |
| `useCollapse(engine)` | `collapse`, `expand`, `toggleCollapse` |
| `useEvaluation(engine)` | `evaluate`, `getResults` |
| `useNodeToolbar(engine)` | `setActions`, `showToolbar`, `hideToolbar` |

## Phase 9 Composables

| Composable | Description |
|------------|-------------|
| `useSnap(engine)` | `snapNode`, `snapAll`, `setGridSize`, `toggle`, `isEnabled`, `getGridSize` |
| `useGroups(engine)` | `createGroup`, `deleteGroup`, `moveGroup`, `toggleCollapse`, `getGroupBounds`, `getAllGroups` |
| `useLayout(engine)` | `applyLayout(algorithm, options)`, `computeLayout` |
| `useSearch(engine)` | `search`, `filterByType`, `clearHighlights`, `isHighlighted`, `results` (reactive) |
| `useSnapshots(engine)` | `createSnapshot`, `restoreSnapshot`, `diff`, `listSnapshots`, `deleteSnapshot` |
| `useShortcuts(engine)` | `setShortcut`, `onAction`, `getBinding`, `getAllBindings` |
| `useHelperLines(engine)` | `computeHelperLines`, `getActiveLines`, `clearLines` |
| `usePerfMonitor(engine)` | `show`, `hide`, `toggle`, `getFPS`, `isVisible` |
| `useEdgeReconnect(engine)` | `startReconnect`, `completeReconnect`, `cancel`, `setValidator`, `isReconnecting` |
| `useZoomToSelection(engine)` | `zoomToSelection(nodeIds, padding)`, `zoomToSelected` |

## Example: Full Setup
```vue
<script setup>
import { SciFlow, useSciFlow, useLayout, useSearch, useSnap } from '@sci-flow/vue';

const { engine, nodes, edges } = useSciFlow({ /* options */ });
const { applyLayout } = useLayout(engine);
const { search, results } = useSearch(engine);
const { toggle: toggleSnap } = useSnap(engine);
</script>
<template>
  <button @click="applyLayout('dagre')">Auto Layout</button>
  <button @click="toggleSnap()">Toggle Snap</button>
  <SciFlow :engine="engine" :nodes="nodes" :edges="edges" />
</template>
```

> **API Parity**: All composables have identical APIs to their React hook counterparts.
> The only difference is the `engine` parameter: `ShallowRef<SciFlow | null>` (Vue) vs `SciFlow | null` (React).
