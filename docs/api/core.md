# Core API Reference

## Engine

### `new SciFlow(options)`
Creates a new SciFlow engine instance.

```ts
const engine = new SciFlow({
  container: document.getElementById('flow')!,
  initialState: { nodes: [...], edges: [...] },
  renderer: 'svg',
  plugins: { collisionMode: 'push', snapOptions: { gridSize: 20 } }
});
```

## State Management

| Method | Description |
|--------|-------------|
| `stateManager.setNodes(nodes)` | Replace all nodes |
| `stateManager.setEdges(edges)` | Replace all edges |
| `stateManager.addNode(node)` | Add a single node |
| `stateManager.removeNode(id)` | Remove node + connected edges |
| `stateManager.addEdge(edge)` | Add a single edge |
| `stateManager.removeEdge(id)` | Remove a single edge |
| `stateManager.setSelection(nodeIds, edgeIds)` | Set selection |
| `stateManager.setViewport(viewport)` | Set viewport state |
| `stateManager.toJSON()` / `fromJSON(json)` | Serialize/deserialize graph |
| `stateManager.undo()` / `redo()` | Undo/redo with history |
| `stateManager.forceUpdate()` | Trigger re-render |

## Plugin Access

All plugins via `engine.plugins.*`:

### Interaction Managers
| Plugin | Access | Description |
|--------|--------|-------------|
| Touch | `engine.plugins.touch` | Pinch, tap-to-connect, gestures |
| Resizer | `engine.plugins.resizer` | Node resize handles |
| Toolbar | `engine.plugins.toolbar` | Floating node toolbar |
| Edge Labels | `engine.plugins.edgeLabels` | Labels at edge midpoint |
| Drop | `engine.plugins.drop` | External drag-and-drop |
| Lasso | `engine.plugins.lasso` | Freeform selection |
| Collision | `engine.plugins.collision` | Node overlap prevention |
| Snap | `engine.plugins.snap` | Snap-to-grid |
| Groups | `engine.plugins.groups` | Node grouping |
| Reconnect | `engine.plugins.reconnect` | Edge reconnection |
| Shortcuts | `engine.plugins.shortcuts` | Keyboard bindings |
| Helper Lines | `engine.plugins.helperLines` | Alignment guides |
| Annotations | `engine.plugins.annotations` | Edge path annotations |

### Feature Managers
| Plugin | Access | Description |
|--------|--------|-------------|
| LOD | `engine.plugins.lod` | Level of Detail |
| Animation | `engine.plugins.animation` | Edge/node animations |
| Export | `engine.plugins.exporter` | PNG/SVG/JSON export |
| Collapse | `engine.plugins.collapse` | Expand/collapse subtrees |
| Evaluation | `engine.plugins.evaluation` | Graph computation |
| Layout | `engine.plugins.layout` | Auto-arrange algorithms |
| Search | `engine.plugins.search` | Node search & filter |
| Zoom to Selection | `engine.plugins.zoomToSelection` | Viewport fitting |
| Snapshots | `engine.plugins.snapshots` | Versioned state |
| Collab | `engine.plugins.collab` | CRDT collaborative editing |
| Perf Monitor | `engine.plugins.perfMonitor` | FPS/memory overlay |
| A11y | `engine.plugins.a11y` | Accessibility |
| Edge Bundler | `engine.plugins.edgeBundler` | Parallel edge bundling |
| Sticky Notes | `engine.plugins.stickyNotes` | Canvas annotations |
| Plugin API | `engine.plugins.pluginAPI` | Third-party plugin system |
| History Persistence | `engine.plugins.historyPersistence` | Undo/redo persistence |

## Types

```ts
interface Node {
  id: string; type: string; position: Position;
  data?: Record<string, unknown>; style?: Record<string, unknown>;
  selected?: boolean; parentId?: string;
}

interface Edge {
  id: string; source: string; target: string;
  sourceHandle: string; targetHandle: string;
  type?: string; style?: EdgeStyle; label?: string;
  selected?: boolean;
}

interface Position { x: number; y: number; }
interface ViewportState { x: number; y: number; zoom: number; }
```
