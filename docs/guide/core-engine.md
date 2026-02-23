# Core Engine

The central piece of `sci-flow` is the `SciFlow` class. It orchestrates the internal state manager, the interaction manager, and the renderers.

## Initialization

To start using `sci-flow`, you only need a container element:

<InteractiveFlow 
  title="Empty Engine"
  :nodes="[]"
  :edges="[]"
  height="200px"
/>

```typescript
import { SciFlow } from '@sci-flow/core';

const engine = new SciFlow({
  container: document.getElementById('flow-container'),
  renderer: 'svg', // or 'canvas' or 'auto'
  theme: 'dark'
});
```

## Options

The `SciFlow` constructor accepts an options object:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `HTMLElement` | **Required** | The DOM element where the flow will be rendered. |
| `renderer` | `'svg' \| 'canvas' \| 'auto'` | `'auto'` | The rendering mode. |
| `theme` | `'light' \| 'dark' \| Theme` | `'light'` | The visual theme. |
| `minZoom` | `number` | `0.1` | Minimum zoom level. |
| `maxZoom` | `number` | `4.0` | Maximum zoom level. |

## Agnostic Nature

The core is completely framework-neutral. It doesn't use React, Vue, or any other UI library. This allows you to build standard web applications or even integrate it into legacy systems.

The core managing:
1. **Node Registry**: Registering what types of nodes exist.
2. **Event Dispatching**: Subscribing to state changes.
3. **Viewport Control**: Mathematical operations for panning and zooming.
4. **Hit Detection**: Calculating which element is under the mouse.
