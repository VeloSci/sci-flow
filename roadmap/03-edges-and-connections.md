# Roadmap Phase 3: Smart Edges & Connections

## 1. Objective
Move beyond static "cables" to create active, configurable, and animatable edges that can execute actions and react to state changes.

## 2. Key Features

### Actionable Edges
- Edges act as fully interactive elements that can intercept clicks, hovers, and custom actions.
- Ability to mount buttons, labels, dropdowns, or mini UI controls directly _onto_ the edges.
- Edge actions can trigger external state changes or modify graph structure dynamically.

### Advanced Routing Algorithms
- Multiple standard routing strategies: Bezier, Step, Smooth Step, Straight, and Orthogonal.
- Smart edge routing: dynamic collision avoidance to ensure edges route around nodes rather than crossing through them.

### Animations & Real-time Flow
- Built-in support for performant data flow animations (e.g., traveling particles, dashed line running effects).
- Flow speed, color, and thickness can be dynamically bound to the node's output data (e.g., thicker lines for heavier payloads, faster animations for high-frequency events).

## 3. Milestones
- [ ] Implement core math logic for multi-type edge curve generation.
- [ ] Add the interactive hit-box layer for edges (ensuring perfect hit detection on curves in both SVG and Canvas).
- [ ] Develop the edge animation system (`stroke-dashoffset` for SVG, `requestAnimationFrame` interpolation for Canvas).
- [ ] Build logic for inserting and anchoring DOM/SVG elements mathematically along the path of an edge.
