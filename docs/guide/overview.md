# Overview

`sci-flow` is a powerful, low-level engine for creating interactive node-based editors and data flow visualizations. It was built with scientific instrumentation and complex data pipelines in mind.

## Core Features

- **Decoupled Architecture**: The logic (Core) is completely separated from the rendering (SVG/Canvas).
- **Infinite Scalability**: Switch between SVG for interactivity and Canvas for performance with thousands of nodes.
- **Directional Layouts**: Native support for Horizontal and Vertical flow layouts with automatic port positioning.
- **Universal Theming**: Built-in light/dark/system theme support that propagates across all framework adapters.
- **Atomic State**: Uses a centralized `StateManager` for predictable data flow and easy undo/redo.

## Why sci-flow?

Unlike other flow libraries, `sci-flow` prioritizes:
1. **Mathematical Accuracy**: Coordinates and dimensions are strictly managed to ensure zero pixel drift.
2. **Framework Agnostic**: The exact same core engine runs in React, Vue, Svelte, and Vanilla JS with 100% visual consistency.
3. **Extensibility**: Easily create new node types, edge routers, or even completely new renderers.

## Ecosystem

- `@sci-flow/core`: The agnostic logic and state manager.
- `@sci-flow/react`: Native React components and hooks.
- `@sci-flow/vue`: Native Vue 3 components and composables.
- `@sci-flow/svelte`: Svelte 5 integration with native snippets.
- `@sci-flow/vanilla`: Direct browser integration for any JS environment.

