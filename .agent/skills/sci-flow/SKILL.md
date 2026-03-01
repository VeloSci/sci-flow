---
name: sci-flow
description: High-performance node-based visual editor library for rendering flowcharts, node networks, and advanced graphical connections in React, Vue, and Svelte.
---

# SciFlow Skill

This skill allows agents to integrate and manage **sci-flow**, a strictly typed, framework-agnostic node-based visual editor library specialized in high-performance SVG animations and deep graph customization.

## Quick Start (React Example)

To initialize a flow graph in a React application:

```tsx
import { SciFlow, Background, BackgroundVariant } from '@sci-flow/react';
import '@sci-flow/core/styles.css'; // Always include the base CSS

const initialNodes = [
  { id: '1', position: { x: 100, y: 100 }, data: { label: 'Start' } },
  { id: '2', position: { x: 300, y: 100 }, data: { label: 'Process' } },
];
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'radar', animated: true },
];

function FlowApp() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <SciFlow 
        nodes={initialNodes}
        edges={initialEdges}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </SciFlow>
    </div>
  );
}
```

## Core Concepts

- **Framework-Agnostic Core**: `@sci-flow/core` handles math, routing, panning, zooming, and state.
- **Framework Wrappers**: `@sci-flow/react` (and vue/svelte) react to state changes and render DOM nodes.
- **Layers**: 
  1. Background (Grid/Dots)
  2. Data Nodes (HTML `div` layers mapped to translation coordinates)
  3. Edges (Global `<svg>` layer spanning the canvas drawing connections)
- **SVG Animations**: Hardware-accelerated animations like `radar`, `dash`, `symbols` utilizing `<animate>` definitions.

## Guidelines for Agents

1. **State Mutation**: DO NOT mutate the `data`, `position`, or `nodes` arrays directly in framework logic (e.g., using `useState` in a React component for dragging). Let `sci-flow`'s internal Event Bus handle dragging and selection.
2. **Custom Nodes**: Create custom nodes by building normal React/Vue components that expose at least one `<Handle type="source" />` or `<Handle type="target" />`. Register them via the `nodeTypes` mapping prop.
3. **Custom Edges**: Create custom edges by wrapping `<BaseEdge>` or using SVG `<path>` tags. You MUST use provided math utilities like `getBezierPath` since edges live strictly within an SVG container.
4. **Dimensions**: The `<SciFlow>` component MUST be wrapped in a parent container (`<div>`) that has an explicit `width` and `height` to render coordinate properly.
5. **Animations**: DO NOT use JavaScript (`requestAnimationFrame`) to animate edges. Rely on the declarative `type="radar"` or `animated={true}` properties.

## Synthesis of Possibilities

- **Custom Node Interfaces**: Buttons, Inputs, Color Pickers inside graph nodes.
- **Intelligent Routing**: Bezier, Step, Straight, and SmoothStep path finding algorithms out-of-the-box.
- **Complex Edge Styles**: Dash arrays, pulsating edges, trailing particles, glowing lines.
- **Plugins**: History tracking (Undo/Redo Command Pattern), Auto-layouting, and Selection Boxes.

## Agent Implementation Checklist

When tasked with adding a flow graph to a project:
1. **Container**: Verify a parent `<div>` has an explicit layout (`height: 100%`, `width: 100%`).
2. **CSS Imports**: The core `styles.css` of `sci-flow` must be imported in the entry file or component.
3. **Data Model**: Verify `initialNodes` and `initialEdges` variables are correctly structured.
4. **Instantiation**: Wrap everything in `<SciFlow>`. 
5. **Types Definitions**: If adding custom components, define `nodeTypes` and `edgeTypes` dictionaries *outside* of the render closure (or memoize them) to prevent infinite re-mounting loops.
6. **Handles**: Verify custom nodes expose target/source `<Handle />` components.

## Comprehensive Guides
- [Animations Architecture](./resources/animations.md)
- [Custom Nodes & Edges Architecture](./resources/custom-nodes-edges.md)
- [Framework Integration Mechanics](./resources/framework-integration.md)

## Practical Examples
- [React Integration](./examples/react-integration.tsx)
- [Vue Integration](./examples/vue-setup.vue)
- [Svelte Integration](./examples/svelte-setup.svelte)
- [Custom Node Implementation](./examples/custom-node.tsx)
- [Bi-Directional Custom Edge](./examples/custom-edge.tsx)
