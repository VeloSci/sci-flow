<script setup>
const animations = [
  'draw', 'draw-reverse', 'march', 'march-reverse', 'draw-erase', 'fade', 'thick-pulse', 'color-pulse', 'dots-flow', 'comet',
  'glow', 'scale-center', 'scale-start', 'wavy-draw', 'zigzag-draw', 'fusion', 'wipe', 'data-packet', 'ping-pong', 'swarm',
  'arrow-travel', 'arrow-flow', 'arrow-bounce', 'spin-square', 'morph-slide', 'sine-orbit', 'spin-x', 'radar', 'draw-arrow', 'direction-pulse'
];

const showcaseNodes = [];
const showcaseEdges = [];

animations.forEach((anim, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const xOffset = col * 400;
  const yOffset = row * 100 + 50;

  showcaseNodes.push({
    id: `src_${i}`,
    type: 'default',
    position: { x: 50 + xOffset, y: yOffset },
    data: { label: anim },
    outputs: { out: { label: ' ' } }
  });

  showcaseNodes.push({
    id: `dst_${i}`,
    type: 'default',
    position: { x: 300 + xOffset, y: yOffset },
    data: { label: ' ' },
    inputs: { in: { label: ' ' } }
  });

  showcaseEdges.push({
    id: `e_${i}`,
    source: `src_${i}`,
    sourceHandle: 'out',
    target: `dst_${i}`,
    targetHandle: 'in',
    animated: true,
    style: { animationType: anim, animationDuration: '3s' }
  });
});

const showcaseHeight = `${Math.ceil(animations.length / 2) * 100 + 50}px`;
</script>

# Animated Edges

Scientific pipelines often require visual emphasis on certain data flows. `sci-flow` provides **30 animation variants** to suit different diagnostic needs.

<InteractiveFlow 
  title="All 30 Animations Showcase"
  :nodes="showcaseNodes"
  :edges="showcaseEdges"
  :height="showcaseHeight"
/>

## Animation Types

### Category 1: Dash/Stroke Animations

| Name | Description |
|------|-------------|
| `draw` | Line draws from source to target |
| `draw-reverse` | Line draws from target to source |
| `march` | Marching dashes (ants pattern) |
| `march-reverse` | Reverse marching dashes |
| `draw-erase` | Draw then erase |
| `dots-flow` | Round dots flowing along the edge |
| `comet` | Long segment sweeping across |
| `scale-center` | Grows from center |
| `scale-start` | Grows from start |
| `fusion` | Draws from center outward |

### Category 2: CSS Effect Animations

| Name | Description |
|------|-------------|
| `fade` | Opacity pulse |
| `thick-pulse` | Stroke width pulse |
| `color-pulse` | Stroke color transition |
| `glow` | Neon drop-shadow pulse |
| `wipe` | Clip-path reveal |

### Category 3: Traveling Object Animations

| Name | Description |
|------|-------------|
| `data-packet` | Single dot traveling along the edge |
| `ping-pong` | Dot bouncing between source and target |
| `swarm` | Multiple colored dots |
| `arrow-travel` | Single arrow traveling |
| `arrow-flow` | Multiple arrows in formation |
| `arrow-bounce` | Arrow bouncing back and forth |
| `spin-square` | Spinning square traveling |
| `morph-slide` | Morphing rectangle |
| `sine-orbit` | Dot with wave oscillation |
| `spin-x` | Spinning X mark |
| `radar` | Dot with expanding ring |

### Category 4: Compound Animations

| Name | Description |
|------|-------------|
| `draw-arrow` | Line draws + arrow follows |
| `direction-pulse` | March + fading center arrow |

## How it works

In `sci-flow`, animation is handled via CSS `@keyframes` and SVG `animateMotion`. By setting `animated: true` and choosing an `animationType`, the renderer applies the appropriate visual effects efficiently. Phase 2 animations (traveling objects) use SVG's native `<animateMotion>` to follow the edge's actual computed path—even for curved bezier and smart-routed edges.

### Custom Duration and Easing

```ts
edge.style = {
  animationType: 'arrow-flow',
  animationDuration: '3s',
  animationEasing: 'ease-in-out',
  animationColor: '#ff6b6b'
};
```

### Backward Compatibility

Legacy animation names continue to work:
- `pulse` → `thick-pulse`
- `dash` → `march`
- `dotted` → `dots-flow`
- `arrows` → `arrow-flow`
- `beam` → `comet`
