# Animated Edges

Scientific pipelines often require visual emphasis on certain data flows. `sci-flow` provides multiple animation variants to suit different diagnostic needs.

<InteractiveFlow 
  title="Advanced Flow Animations"
  :nodes="[
    { id: 'src1', type: 'default', position: { x: 50, y: 50 }, data: { label: 'Arrows' }, outputs: { out: { label: 'Dir' } } },
    { id: 'dst1', type: 'default', position: { x: 300, y: 50 }, data: { label: 'Target' }, inputs: { in: { label: 'In' } } },
    { id: 'src2', type: 'default', position: { x: 50, y: 150 }, data: { label: 'Pulse' }, outputs: { out: { label: 'State' } } },
    { id: 'dst2', type: 'default', position: { x: 300, y: 150 }, data: { label: 'Target' }, inputs: { in: { label: 'In' } } },
    { id: 'src3', type: 'default', position: { x: 50, y: 250 }, data: { label: 'Symbols' }, outputs: { out: { label: 'Stream' } } },
    { id: 'dst3', type: 'default', position: { x: 300, y: 250 }, data: { label: 'Target' }, inputs: { in: { label: 'In' } } }
  ]"
  :edges="[
    { id: 'e1', source: 'src1', sourceHandle: 'out', target: 'dst1', targetHandle: 'in', animated: true, style: { animationType: 'arrows' } },
    { id: 'e2', source: 'src2', sourceHandle: 'out', target: 'dst2', targetHandle: 'in', animated: true, style: { animationType: 'pulse' } },
    { id: 'e3', source: 'src3', sourceHandle: 'out', target: 'dst3', targetHandle: 'in', animated: true, style: { animationType: 'symbols' } }
  ]"
  height="400px"
/>

## Animation Types

### 1. Arrows (`animationType: 'arrows'`)
Uses a moving dash pattern to indicate directionality.

### 2. Pulse (`animationType: 'pulse'`)
A smooth opacity pulse on a solid line, useful for indicating status or "heartbeat".

### 3. Symbols (`animationType: 'symbols'`)
Overlays moving symbols (`> > >`) on top of a solid line. This provides the strongest visual indication of flow across complex graphs.

## How it works

In `sci-flow`, animation is handled via CSS and SVG attributes. By setting `animated: true` and choosing an `animationType`, the renderer applies specific classes and paths to handle the visual effects efficiently.
