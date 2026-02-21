# Roadmap Phase 2: Advanced Node Engine

## 1. Objective
Develop a highly flexible, Blender-style node system where nodes act as "control centers" rather than simple input/output blocks.

## 2. Key Features

### Multi-Port & Complex Internal Routing
- Nodes can have multiple inputs and multiple outputs, dynamically configurable by the user.
- Internal node routing: an input can be split or routed inside the node into multiple different outputs (functioning as a hub, switch, or splitter).
- Ports carry strongly-typed metadata detailing the type of data they accept/emit (similar to Blender Geometry Nodes sockets).

### Dynamic Content & HTML/Image Injection
- Nodes can host complex, reactive real-time DOM elements.
- Built-in support for injecting dynamically updating HTML, Canvas snippets, or live-updating images inside the nodes.
- Node layouts automatically resize securely and smoothly based on the internal content's dimensions.

### Custom Code Execution
- Nodes can contain isolated, customizable pieces of code (functions/expressions/callbacks).
- Safe execution sandbox for evaluating these custom logic blocks in real-time, executing math or string manipulation securely.

## 3. Milestones
- [ ] Define the agnostic `NodeBase` interface supporting dynamic multi-port data structures.
- [ ] Implement HTML/ForeignObject injection mechanisms for the SVG renderer.
- [ ] Implement offscreen Canvas/Image compositing for the Canvas renderer pipeline.
- [ ] Create the custom logic sandbox for node formulas and real-time execution.
- [ ] Build the "Control Center" geometric primitives and node layouts.
