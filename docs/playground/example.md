---
layout: doc
title: Full Example
outline: false
pageClass: full-width-page
---

<style>
/* Scoped overrides for full-width layout */
.full-width-page .VPDoc .container {
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 40px !important;
}

.full-width-page .aside {
  display: none !important;
  width: 0px !important;
}

.full-width-page .content-container {
  max-width: 100% !important;
  padding-bottom: 30px !important;
}

.full-width-page .VPDoc .content {
  max-width: 100% !important;
  padding: 0 !important;
}

.full-width-page .VPDoc .content-body {
  max-width: 100% !important;
}

/* Ensure the markdown content itself also expands */
.full-width-page .vp-doc {
  max-width: 100% !important;
}

/* Hide padding/margins on side containers if they still exist */
.full-width-page .VPDoc .aside-container {
  display: none !important;
}
</style>

# Full Example

<FullExampleApp />

## Active Features

### 🎯 Interactive Panels

| Panel | Location | What it does |
|-------|----------|-------------|
| **Node Palette** | Top-left | Drag nodes onto canvas (5 types) |
| **Feature Panel** | Top-right | Export, animation, collision, LOD, evaluation |
| **Toolbar** | Top bar | Routing, animation, line styles, file ops |
| **Minimap** | Bottom-right | Real-time graph overview |

### 📱 Mobile Support (auto-detected)
- **Pinch-to-zoom** — Multi-touch zoom centered on gesture
- **Tap-to-connect** — Tap source port, tap target port
- **Double-tap** — Fit view
- **Responsive targets** — 44px+ touch areas (WCAG compliant)

### ⚡ New Features

| Feature | Try it |
|---------|--------|
| **Export** | Click PNG/SVG/JSON in Feature Panel |
| **Auto-Layout** | Click "Auto-Layout" to animate nodes into grid |
| **Collision** | Switch between none/push/block modes |
| **LOD** | Zoom out to see simplified/dot rendering |
| **Evaluate** | Click "Run Pipeline" to execute graph |
| **Drag & Drop** | Drag nodes from palette to canvas |
| **Edge Labels** | See "Signal A" and "Low Pass" on edges |
| **Node Shapes** | Nodes support rectangle/circle/diamond/hexagon |
| **Connection Validation** | Self-loops and duplicates prevented |
