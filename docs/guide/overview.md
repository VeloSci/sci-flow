# Overview

`sci-flow` is a powerful, low-level engine for creating interactive node-based editors and data flow visualizations. It was built with scientific instrumentation and complex data pipelines in mind.

## Core Features

- **Decoupled Architecture**: The logic (Core) is completely separated from the rendering (SVG/Canvas).
- **Infinite Scalability**: Switch between SVG for interactivity and Canvas for performance with thousands of nodes.
- **Atomic State**: Uses a centralized `StateManager` for predictable data flow and easy undo/redo.
- **Rich Interaction**: Built-in support for zooming, panning, multi-selection, and group dragging.

## Why sci-flow?

Unlike other flow libraries, `sci-flow` prioritizes:
1. **Mathematical Accuracy**: Coordinates and dimensions are strictly managed to ensure zero pixel drift.
2. **Extensibility**: Easily create new node types, edge routers, or even completely new renderers.
3. **Performance**: Designed to handle real-time data updates without UI lag.

## Ecosystem

- `@sci-flow/core`: The agnostic logic and state manager.
- `@sci-flow/react`: Native React components and hooks.
- `@sci-flow/vue`: (Coming Soon) Vue 3 integration.
- `@sci-flow/vanilla`: Direct browser integration for static pages.
