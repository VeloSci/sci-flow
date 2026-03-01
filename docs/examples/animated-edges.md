<script setup>
const animations = [
  'draw', 'draw-reverse', 'march', 'march-reverse', 'draw-erase', 'fade', 'thick-pulse', 'color-pulse', 'dots-flow', 'comet',
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
    type: anim,
    position: { x: 50 + xOffset, y: yOffset },
    data: { label: anim, title: anim, subtitle: anim, description: anim },
    outputs: { out: { label: ' ' } }
  });

  showcaseNodes.push({
    id: `dst_${i}`,
    type: anim,
    position: { x: 300 + xOffset, y: yOffset },
    data: { label: anim, title: anim, subtitle: anim, description: anim },
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
| `draw-arrow` | Line draws + arrow follows (`draw-arrow`) |
| `direction-pulse` | March + fading center arrow (`direction-pulse`) |
| `draw` | Line draws from source to target (`draw`) |
| `draw-reverse` | Line draws from target to source (`draw-reverse`) |
| `march` | Marching dashes (ants pattern) (`march`) |
| `march-reverse` | Reverse marching dashes (`march-reverse`) |
| `draw-erase` | Draw then erase (`draw-erase`) |
| `dots-flow` | Round dots flowing along the edge (`dots-flow`) |
| `comet` | Long segment sweeping across (`comet`) |
| `scale-center` | Grows from center (`scale-center`) |
| `scale-start` | Grows from start (`scale-start`) |
| `fusion` | Draws from center outward (`fusion`) |

### Category 2: CSS Effect Animations

| Name | Description |
|------|-------------|
| `fade` | Opacity pulse (`fade`) |
| `thick-pulse` | Stroke width pulse (`thick-pulse`) |
| `color-pulse` | Stroke color transition (`color-pulse`) |
| `glow` | Neon drop-shadow pulse (`glow`) |
| `wipe` | Clip-path reveal (`wipe`) |

### Category 3: Traveling Object Animations

| Name | Description |
|------|-------------|
| `data-packet` | Single dot traveling along the edge (`data-packet`) |
| `ping-pong` | Dot bouncing between source and target (`ping-pong`) |
| `swarm` | Multiple colored dots (`swarm`) |
| `arrow-travel` | Single arrow traveling (`arrow-travel`) |
| `arrow-flow` | Multiple arrows in formation (`arrow-flow`) |
| `arrow-bounce` | Arrow bouncing back and forth (`arrow-bounce`) |
| `spin-square` | Spinning square traveling (`spin-square`) |
| `morph-slide` | Morphing rectangle (`morph-slide`) |
| `sine-orbit` | Dot with wave oscillation (`sine-orbit`) |
| `spin-x` | Spinning X mark (`spin-x`) |
| `radar` | Dot with expanding ring (`radar`) |

### Category 4: Compound Animations

| `draw-arrow` | Line draws + arrow follows (`draw-arrow`) |

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
