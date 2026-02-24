# Themes & Layout

SciFlow provides built-in support for multiple visual themes and layout directions, ensuring a consistent experience across all framework adapters.

## Themes

SciFlow uses a CSS-variable based theming system. It supports `light`, `dark`, and `system` modes out of the box, and allows for custom theme objects.

### Usage

All framework adapters expose a `theme` prop that propagates directly to the core engine without re-mounting the component.

```ts
// Vanilla Core
engine.setTheme('dark');

// React / Vue / Svelte
<SciFlow theme="dark" ... />
```

### Custom Themes

You can provide a partial theme object to override specific colors:

```ts
engine.setTheme({
  bg: '#1a1a1a',
  nodeBg: '#2a2a2a',
  edgeColor: '#555'
});
```

## Layout Direction

SciFlow supports two layout orientations: `horizontal` (left-to-right) and `vertical` (top-to-bottom).

### Switching Directions

When you change the direction via `engine.setDirection(dir)`, SciFlow automatically:
1. Re-calculates port positions (Top/Bottom for vertical, Left/Right for horizontal).
2. Adjusts port labels (labels are hidden in vertical mode to maintain a clean look).
3. Optionally triggers an **Auto-Layout** algorithm.

### Auto-Layout

SciFlow includes a built-in topological sort algorithm that can automatically re-position nodes when the direction changes.

- **Vertical**: Nodes are layered from top to bottom based on their dependency graph.
- **Horizontal**: Nodes are layered from left to right.

```ts
// Switch to vertical and auto-reposition nodes
engine.setDirection('vertical');
```

## Visual Consistency

One of SciFlow's core design goals is **Universal Rendering**. Whether you are using React, Vue, Svelte, or Vanilla JS, the resulting flow diagram is pixel-perfectly identical. 

This is achieved by:
1. **Core-Driven Nodes**: The basic structure of every node is rendered by the agnostic core.
2. **Framework Portals**: Custom UI is injected into the core-rendered shells using native framework portals (React Portals, Vue Teleport, Svelte snippets).
3. **Shared Styles**: All renderers share the same CSS engine and coordinate system.
