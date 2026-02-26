# Svelte API Reference

## Main Integration

### `useSciFlow(options)`
Returns `{ state, getInstance }`. Core function to initialize and manage SciFlow via Svelte stores.

- `state`: A Svelte readable store containing the current `FlowState`.
- `getInstance()`: Returns the initialized `SciFlow` engine.

## Components

### `<SciFlow>`
The primary container component for the canvas.

| Prop | Type | Description |
|------|------|-------------|
| `initialNodes` | `Node[]` | Initial node data array |
| `initialEdges` | `Edge[]` | Initial edge data array |
| `theme` | `'light' \| 'dark' \| 'system' \| Partial<Theme>` | Visual theme specification |
| `direction` | `'horizontal' \| 'vertical'` | Flow direction layout |
| `renderer` | `'svg' \| 'canvas' \| 'auto'` | Rendering engine to use |
| `minZoom` | `number` | Minimum allowed zoom level |
| `maxZoom` | `number` | Maximum allowed zoom level |
| `nodeTypes` | `Record<string, ComponentType>` | Mapping of node types to Svelte components |
| `onInit` | `(engine: SciFlow) => void` | Callback invoked when engine initializes |

#### Events

| Event | Type | Description |
|-------|------|-------------|
| `on:init` | `CustomEvent<SciFlow>` | Fired when the engine is initialized. |
| `on:change` | `CustomEvent<FlowState>` | Fired whenever the flow state changes. |

### Component Methods

The `<SciFlow>` component exports the following functions you can call by binding to the component instance:

- `fitView(padding?: number): void`
- `centerNode(id: string): void`

## Example: Full Setup
```svelte
<script lang="ts">
  import { SciFlow } from '@sci-flow/svelte';
  import CustomMathNode from './CustomMathNode.svelte';

  let nodes = [
    { id: '1', type: 'math', position: { x: 100, y: 100 }, data: { value: 42 } }
  ];
  let edges = [];

  const nodeTypes = {
    math: CustomMathNode
  };

  function handleInit(event) {
    const engine = event.detail;
    console.log("SciFlow initialized", engine);
  }
  
  function handleChange(event) {
    const state = event.detail;
    console.log("Flow state changed", state);
  }
</script>

<div style="width: 100vw; height: 100vh;">
  <SciFlow 
    initialNodes={nodes} 
    initialEdges={edges}
    nodeTypes={nodeTypes}
    theme="dark"
    on:init={handleInit}
    on:change={handleChange}
  />
</div>
```

> **API Note**: The Svelte wrapper uses generic Svelte Stores for reactivity. It leverages `createEventDispatcher` to broadcast state changes via standard component events.
