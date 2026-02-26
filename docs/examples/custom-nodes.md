# Custom Nodes Example

One of the most powerful features of `sci-flow` is the ability to use standard React components as nodes. This allows you to build complex UIs (forms, charts, editors) inside your flow.

## 1. Define the React Component

A custom node receives the `node` object as a prop.

```tsx
import React from 'react';

const MathNode = ({ node }) => {
  return (
    <div style={{ 
      padding: '10px', 
      background: '#fff', 
      border: '2px solid #333',
      borderRadius: '8px',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Math Operator</div>
      <div style={{ fontSize: '20px', textAlign: 'center' }}>
        {node.data.operation === 'add' ? '+' : '-'}
      </div>
    </div>
  );
};

MathNode.nodeType = 'math-node'; // Optional: static property for automatic registration
export default MathNode;
```

## 2. Register and Use

Pass the component to the `nodeTypes` prop of `SciFlow`.

```tsx
import { SciFlow } from '@sci-flow/react';
import MathNode from './MathNode';

const nodes = [
  { 
    id: 'n1', 
    type: 'math-node', 
    position: { x: 100, y: 100 },
    data: { operation: 'add' }
  }
];

export default function App() {
  return (
    <SciFlow 
      initialNodes={nodes} 
      nodeTypes={[MathNode]} 
    />
  );
}
```

## How it works

The core `SciFlow` engine creates an SVG `<foreignObject>` as a container. The React wrapper then uses `createPortal` to mount your component into that DOM element. This keeps the rendering high-performance while allowing full React interactivity.

## Live Demo

<FeatureDemo component="CustomNodeDemo" />

> **Try it!** Add random shapes, change node shapes, and toggle resize mode.
