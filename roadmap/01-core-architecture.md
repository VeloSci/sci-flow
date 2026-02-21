# Roadmap Phase 1: Core Architecture & Rendering Engine

## 1. Objective
Establish the foundational, framework-agnostic engine for `sci-flow`. The core must prioritize extreme performance, security, and dynamic rendering capabilities without relying on any specific UI framework.

## 2. Key Features

### Agnostic Core Engine
- Architecture built entirely in vanilla TypeScript.
- Separation of concerns: state management, event handling, and rendering are entirely decoupled.
- Strongly typed, secure data structures preventing prototype pollution and unsafe execution contexts.

### Dual Rendering Pipeline (SVG & Canvas)
- **SVG Renderer:** Default for flows with a low to moderate number of nodes (`< 1000`). Ideal for rich DOM integration, crisp styling, and simple accessibility.
- **Canvas/WebGL Renderer:** Automatic or manual threshold-based switching for massive graphs (`> 1000` nodes). Ensures constant 60fps rendering even with thousands of elements.
- **Virtualization:** Only render nodes and edges currently visible within the viewport (culling) to maintain extreme speed.

### Secure Processing
- Strict validation of all incoming definitions (nodes, edges, models, custom code snippets).
- Isolated contexts for any dynamic execution mechanisms to prevent XSS or unauthorized context access.

## 3. Milestones
- [ ] Setup vanilla TS monorepo architecture (`packages/core`).
- [ ] Implement the dual SVG/Canvas renderer interface.
- [ ] Implement smart automatic switching logic based on node/edge count metrics.
- [ ] Setup the base viewport coordinate system (Transform matrix, scale, translate, pan & zoom math).
