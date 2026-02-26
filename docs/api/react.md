# React API Reference

## Main Hook

### `useSciFlow(options)`
Returns `{ engine, nodes, edges, portals }`. Core hook to initialize and manage the SciFlow engine.

## Component

### `<ReactSciFlow>`
| Prop | Type | Description |
|------|------|-------------|
| `engine` | `SciFlow` | Engine instance from `useSciFlow` |
| `nodes` | `Node[]` | Current nodes |
| `edges` | `Edge[]` | Current edges |
| `portals` | `Map` | Portal mount points |
| `onNodesChange` | `fn` | Node change callback |
| `onEdgesChange` | `fn` | Edge change callback |

## Feature Hooks

| Hook | Description |
|------|-------------|
| `usePlugins(engine)` | Access all plugin managers |
| `useExport(engine)` | `downloadPNG`, `downloadSVG`, `downloadJSON`, `toSVGString`, `toPNGBlob` |
| `useAnimation(engine)` | `animateNodes`, `setAnimation`, `stopAnimation` |
| `useDrop(engine)` | `onDrop`, `onDragOver` for external drag-and-drop |
| `useValidation(engine)` | `setValidator`, `validateConnection` |
| `useCollapse(engine)` | `collapse`, `expand`, `toggleCollapse` |
| `useEvaluation(engine)` | `evaluate`, `getResults` |
| `useNodeToolbar(engine)` | `setActions`, `showToolbar`, `hideToolbar` |

## Phase 9 Hooks

| Hook | Description |
|------|-------------|
| `useSnap(engine)` | `snapNode`, `snapAll`, `setGridSize`, `toggle`, `isEnabled`, `getGridSize` |
| `useGroups(engine)` | `createGroup`, `deleteGroup`, `moveGroup`, `toggleCollapse`, `getGroupBounds`, `getAllGroups` |
| `useLayout(engine)` | `applyLayout(algorithm, options)`, `computeLayout` |
| `useSearch(engine)` | `search`, `filterByType`, `clearHighlights`, `isHighlighted`, `results` |
| `useSnapshots(engine)` | `createSnapshot`, `restoreSnapshot`, `diff`, `listSnapshots`, `deleteSnapshot` |
| `useShortcuts(engine)` | `setShortcut`, `onAction`, `getBinding`, `getAllBindings` |
| `useHelperLines(engine)` | `computeHelperLines`, `getActiveLines`, `clearLines` |
| `usePerfMonitor(engine)` | `show`, `hide`, `toggle`, `getFPS`, `isVisible` |
| `useEdgeReconnect(engine)` | `startReconnect`, `completeReconnect`, `cancel`, `setValidator`, `isReconnecting` |
| `useZoomToSelection(engine)` | `zoomToSelection(nodeIds, padding)`, `zoomToSelected` |

## Example: Full Setup
```tsx
import { useSciFlow, ReactSciFlow, useLayout, useSearch, useSnap } from '@sci-flow/react';

function App() {
  const { engine, nodes, edges, portals } = useSciFlow({ /* options */ });
  const { applyLayout } = useLayout(engine);
  const { search, results } = useSearch(engine);
  const { toggle: toggleSnap } = useSnap(engine);

  return (
    <div>
      <button onClick={() => applyLayout('dagre')}>Auto Layout</button>
      <button onClick={toggleSnap}>Toggle Snap</button>
      <ReactSciFlow engine={engine} nodes={nodes} edges={edges} portals={portals} />
    </div>
  );
}
```
