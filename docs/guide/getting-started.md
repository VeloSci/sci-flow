# Getting Started

Learn how to integrate `sci-flow` into your project.

## Installation

Install the core package using your favorite package manager:

```bash
pnpm add @sci-flow/core
```

If you are using React, also install the React wrapper:

```bash
pnpm add @sci-flow/react
```

## First Steps (Vanilla)

The most basic setup involves creating an engine and adding a couple of nodes:

```typescript
import { SciFlow } from '@sci-flow/core';

const engine = new SciFlow({
  container: document.getElementById('my-flow'),
});

engine.addNode({
  id: 'node-1',
  type: 'default',
  position: { x: 100, y: 100 },
  outputs: { out1: { label: 'Output' } }
});

engine.addNode({
  id: 'node-2',
  type: 'default',
  position: { x: 400, y: 100 },
  inputs: { in1: { label: 'Input' } }
});

engine.addEdge({
  id: 'edge-1',
  source: 'node-1',
  sourceHandle: 'out1',
  target: 'node-2',
  targetHandle: 'in1'
});
```

## First Steps (React)

Using the React component is even simpler:

```tsx
import { SciFlow } from '@sci-flow/react';

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Hello' } }
];

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <SciFlow initialNodes={initialNodes} />
    </div>
  );
}
```

## Common Next Steps

- [Custom Node Types](/guide/core-engine)
- [Managing State](/guide/state)
- [Styling & Themes](/guide/rendering)
