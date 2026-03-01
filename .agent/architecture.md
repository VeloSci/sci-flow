---
description: Architecture of the sci-flow Core and UI layers for AI Agents
---
# AI SYSTEM INSTRUCTION: sci-flow Architecture

**CRITICAL DIRECTIVE**: This document defines the exact architecture patterns you must follow when contributing to `sci-flow`'s graph engine.

## 1. The Core State Pipeline (`packages/core/`)

The Visual Editor logic is managed outside of React/Vue/Svelte.
- **StateManager**: Every node's `(x, y)` coordinate, width, height, and selection status is tracked here. Every edge connection is tracked here.
- **Viewport**: The canvas `zoom` and `pan` `[x, y]` are tracked centrally.
- **The Event Driven Loop**: When a user drags a node, the UI wrapper catches the mouse event and calls `engine.onNodeDrag(id, dx, dy)`. The core updates the internal state, and emits a change event. The UI wrapper reacts to this change and re-renders the node at the new position.

## 2. Framework UI Implementation Pattern

If you are writing code in `@sci-flow/react`, `@sci-flow/vue`, or `@sci-flow/svelte`, memory management is key because rendering hundreds of nodes is expensive.

- **Rule 1 (Data Flow)**: UI components must be as dumb as possible. They receive `data` and `position` props. 
- **Rule 2 (Reactivity via Subscriptions)**: Wrappers use their native global state patterns (Zustand/Context in React, `reactive()` in Vue, Stores in Svelte) mapped 1:1 to the core `StateManager`.
- **Rule 3 (The Render Tree)**: 
  1. `<Background>`: CSS patterns.
  2. `<NodeLayer>`: Absolute positioned HTML `<div>` elements mapped mathematically to the zoom/pan.
  3. `<EdgeLayer>`: **An `<svg>` block that spans 100% of the viewport**. Edges are `<path>` tags dynamically drawn between the source and target node handles.

## 3. The Plugin Ecosystem (`packages/core/src/plugins/`)

Behaviors are abstracted into plugins via the `PluginManager`.
- **SelectionPlugin**: Draws the selection box overlay when dragging the mouse canvas and flags nodes as `selected: true` in the `StateManager`.
- **HistoryPlugin**: Listens to core mutations, creates `MoveCommand` or `AddNodeCommand` instances, pushes them to a stack, and executes Undo/Redo operations.

## 4. Animation Architecture

To achieve 60fps graph animations on hundreds of bezier paths:
- Global SVG resources are injected via an `<AnimationDefs>` component.
- For example, a `radar` edge doesn't calculate pulsing circles in JS. It references an SVG `<radialGradient>` via a URL (e.g., `url(#radar-gradient)`) applied to the edge's `stroke`.
- **Golden Rule**: Path math is done once in JS, styling and movement along the path is delegated entirely to the browser's SVG rendering engine.
