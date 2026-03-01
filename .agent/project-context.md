---
description: Context & Overview of the sci-flow library for AI Agents
---
# AI SYSTEM INSTRUCTION: sci-flow Context

**CRITICAL DIRECTIVE**: You are reading the core documentation for `sci-flow`. When tasked with modifying, refactoring, or extending this graphical library, you MUST adhere to the principles outlined here.

## 1. Project Definitions
- **Project Goal**: `sci-flow` is a strictly typed, high-performance node-based visual editor library, designed to render flowcharts, node networks, and advanced graphical connections.
- **Graphic Paradigm**: The library relies heavily on layered rendering. HTML nodes sit below a specialized, hardware-accelerated SVG interactive layer that draws paths, markers, and animations.
- **Architecture Paradigm**: Framework-Agnostic Core (`@sci-flow/core`). The graph's mathematical state is completely decoupled from UI wrappers (`@sci-flow/react`, `vue`, `svelte`).

## 2. Core Library Structure
The repository is a Monorepo using `pnpm` workspaces located in `packages/`:

### The Engine (`@sci-flow/core`)
- **Responsibility**: Math, Routing, State, and History. 
- **Data Model**: The graph is a collection of `nodes` (Objects with x, y coordinates and dimensions) and `edges` (Source-to-Target connections).
- **Key Modules**: `StateManager` (single source of truth for all coordinates/selection), `PluginManager` (behavioral add-ons), `EventBus` (internal pub/sub).

### Framework Wrappers (`/react`, `/vue`, `/svelte`)
- **Responsibility**: They observe the `StateManager` and render the Node boxes and SVG Paths natively in their respective virtual DOMs.
- **Mechanism**: They expose components like `<SciFlow />`, `<Handle />`, `<BaseEdge />`.

## 3. The SVG Animation Engine
A massive differentiator of `sci-flow` compared to ordinary libraries is its advanced edge animations.
- **Native SVG**: Instead of JavaScript `requestAnimationFrame` ticking, `sci-flow` pushes animations to the browser's compositor using `<animate>` and `<animateTransform>`.
- **Supported Animations**: The engine ships with complex edge animations like `radar`, `dash`, `dotted`, `spin-x`, `symbols`, and `pulse`. These rely on global `<defs>` injected into the DOM.

## 4. Operational Boundaries (Do NOT do this)
- **DO NOT calculate SVG bounding boxes manually**: Rely on the core routing algorithms (e.g., Bezier, Step).
- **DO NOT mutate state directly in UI components**: Like `sci-notebook`, if a user drags a node in a React component, you don't use React state. You dispatch a drag event to the `StateManager`.
- **DO NOT use JS for Edge animations**: Never write a `setInterval` or `requestAnimationFrame` to animate a line or symbol. Always use declarative SVG `<animatemotion>` or `<animate>` tags.
