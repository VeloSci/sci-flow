# Rendering Pipeline

`sci-flow` uses a specialized multi-layer rendering approach to maintain performance while allowing for complex custom UIs.

## Layer 1: The Grid
The background grid is rendered on a separate canvas or SVG layer. It automatically snaps to pixels to avoid sub-pixel blurring during pans.

## Layer 2: Edges
Edges are rendered as SVG paths. `sci-flow` supports several routing modes:
- **Bezier**: Smooth curves.
- **Straight**: Direct lines.
- **Step**: Manhattan-style right angles.
- **Smart**: Obstacle-aware routing using A-Star pathfinding.

## Layer 3: Nodes
Nodes are essentially containers. In the `SVGRenderer`, nodes consist of:
1. An SVG `<g>` group.
2. A `<foreignObject>` that allows embedding HTML content.
3. SVG `<circle>` elements for ports.

## Port Positioning
Ports are positioned mathematically based on the node's dimensions and the number of inputs/outputs. The `NodeManager` ensures that ports are always perfectly aligned with their labels and edges.

## Auto-Switching
If the number of nodes exceeds a certain threshold (default: 1000), `sci-flow` can automatically switch from SVG to Canvas rendering to maintain a buttery-smooth frame rate.
