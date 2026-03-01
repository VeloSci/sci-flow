# Sci-Flow

High-performance node-based visual editor library for rendering flowcharts, node networks, and advanced graphical connections in React, Vue, and Svelte. Designed for scientific layouts and highly intensive node computations.

## Features
- **Framework Agnostic Core**: Core engine (`@sci-flow/core`) that handles state and math flawlessly.
- **Framework Adapters**: First-party bindings for React (`@sci-flow/react`), Vue (`@sci-flow/vue`), and Svelte (`@sci-flow/svelte`).
- **High Performance**: Renders graph DOM and SVG connections fast with precision tracking.
- **Node-Based Editor**: Construct large scale flowchart tools, visual block editors, and pipeline builders easily.

## Packages
| Package | Version | Description |
|---|---|---|
| [`@sci-flow/core`](./packages/core) | 1.0.0 | Core agnostic engine. |
| [`@sci-flow/react`](./packages/react) | 1.0.0 | React Adapter. |
| [`@sci-flow/vue`](./packages/vue) | 1.0.0 | Vue Adapter. |
| [`@sci-flow/svelte`](./packages/svelte) | 1.0.0 | Svelte Adapter. |

## Quick Start (React)

```bash
npm install @sci-flow/react @sci-flow/core
```

```tsx
import React from 'react';
import { SciFlow, Background, Controls } from '@sci-flow/react';

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { title: 'Node 1' }, type: 'basic' }
];

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <SciFlow initialNodes={initialNodes}>
        <Background />
        <Controls />
      </SciFlow>
    </div>
  );
}
```

## License
MIT License
