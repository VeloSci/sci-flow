# Roadmap Phase 4: Interaction & Agnostic State

## 1. Objective
Provide a robust, highly optimized state management and interaction layer that works seamlessly across Vanilla JS, React, and Vue. Provide comprehensive canvas controls.

## 2. Key Features

### Agnostic State Store
- A lightweight, fast, reactive store built in Vanilla TS (e.g., using a subscriber model or `zustand/vanilla` conceptually).
- Handles massive arrays of nodes and edges without triggering unnecessary global re-renders.
- Component-level subscriptions for extreme granularity.
- Safe serialization and deserialization of the flow diagram state.

### Advanced Viewport Controls
- Infinite panning and zooming with configurable boundaries and limits.
- Smooth, momentum-based scrolling.
- Viewport utilities: "Fit to screen" and "Center on node/selection" logic.
- Minimap integration that renders a flow overview using Canvas or simplified SVG efficiently.

### Node Interactions
- Robust multi-selection capabilities (bounding box select, shift-click).
- Grouping nodes into sub-graphs or visual containers.
- Snapping to a customizable grid or aligning dynamically to other nodes.
- Drag and drop of new nodes into the canvas from an external library panel.

## 3. Milestones
- [ ] Implement the core agnostic state engine with observable/pub-sub patterns.
- [ ] Implement the interaction manager for pan, zoom, and transform matrices.
- [ ] Add the multi-selection and node grouping logic.
- [ ] Build the snapping functionality and grid background renders (dotted, lined, etc).
