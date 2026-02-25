<script setup>
import { sampleFlowData } from '../.vitepress/theme/flows'
</script>

# Interactive Playground

Experience SciFlow across React, Vue, Svelte, and Vanilla JS — all sharing the same agnostic core engine.

<FrameworkDemo 
  :initialNodes="sampleFlowData.nodes" 
  :initialEdges="sampleFlowData.edges" 
  title="Multi-Framework Flow Playground" 
/>

---

## Playground Controls

| Control | Action |
|---------|--------|
| **Tab selector** | Switch between React / Vue / Svelte / Vanilla renderers |
| **⬇ Vertical / ➡ Horizontal** | Toggle layout direction — nodes auto-rearrange |
| **💾 Save JSON** | Download the current flow state as JSON |
| **VitePress theme** | Click the 🌙/☀️ icon to test dark/light mode live |

---

## Features in this Demo

- **Agnostic Core** — The same state, pathfinding, and undo/redo logic runs identically in all four frameworks.
- **Visual Consistency** — All framework tabs use the core's default node renderer, producing identical output.
- **Live Theme Switching** — Theme changes call `engine.setTheme()` in-place without remounting the framework — no flash.
- **Horizontal / Vertical Layout Toggle** — Calling `engine.setDirection()` runs a topological sort on the graph and auto-repositions all nodes. In vertical mode, ports move to the top/bottom edges and labels are hidden.
- **Smart Routing** — A* pathfinding routes edges around nodes.
- **JSON Persistence** — Export and re-import the entire flow state including direction.

## Layout Direction API

```ts
// Switch to vertical layout — auto-repositions all nodes
engine.setDirection('vertical')

// Switch back to horizontal
engine.setDirection('horizontal')
```

In **vertical mode**:
- Input ports appear on the **top** edge of each node
- Output ports appear on the **bottom** edge
- Port labels are hidden to avoid clutter
- Nodes are arranged in topological levels from top to bottom

## Theme API

```ts
// Change theme without remounting
engine.setTheme('dark')   // or 'light' | 'system' | { ...custom }
```

Framework adapters expose `setTheme()` reactively — pass a `theme` prop and the engine updates automatically.

---

## Technical Stack

| Layer | Package | Role |
|-------|---------|------|
| **Engine** | `@sci-flow/core` | Node/Edge state, pathfinding, undo/redo, zoom/pan, direction |
| **React** | `@sci-flow/react` | `SciFlow` component, portal system, `useSciFlow` hook |
| **Vue** | `@sci-flow/vue` | `SciFlow` component, Teleport system, `useSciFlow` composable |
| **Svelte** | `@sci-flow/svelte` | `SciFlow` component, portal action |
| **Vanilla** | `@sci-flow/core` | Direct DOM engine, no framework needed |

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| <kbd>Del</kbd> | Delete selected nodes/edges |
| <kbd>Shift + Drag</kbd> | Area selection |
| <kbd>Space + Drag</kbd> | Pan viewport |
| <kbd>Ctrl + Z</kbd> | Undo |
| <kbd>Ctrl + Y</kbd> | Redo |
