---
layout: doc
title: Collision & LOD
---

# Collision Detection & Level of Detail

## Collision Detection

Prevent nodes from overlapping during drag operations:

```typescript
// Push mode: dragged node pushes others out of the way
engine.plugins.collision.mode = 'push';

// Block mode: prevent the drag if it would overlap
engine.plugins.collision.mode = 'block';

// Disable collision detection
engine.plugins.collision.mode = 'none';

// Get all overlapping pairs
const overlaps = engine.plugins.collision.getOverlappingPairs();
```

### Configuration

```typescript
new SciFlow({
  container: el,
  plugins: { collisionMode: 'push' }
});
```

---

## Level of Detail (LOD)

Automatically simplify node rendering at low zoom levels:

| Zoom Level | LOD | What's Visible |
|------------|-----|----------------|
| > 0.5x | `full` | Everything |
| 0.2x – 0.5x | `simplified` | Header + ports only |
| < 0.2x | `dot` | Header only |

### API

```typescript
engine.plugins.lod.getLevel(); // 'full' | 'simplified' | 'dot'

engine.plugins.lod.setThresholds({
  dotThreshold: 0.2,
  simplifiedThreshold: 0.5
});

engine.plugins.lod.onLevelChange((level) => {
  console.log('LOD changed to:', level);
});
```

### CSS Selectors

Nodes automatically get `data-lod` attribute:

```css
[data-lod="dot"] .sci-flow-node-body { display: none; }
[data-lod="simplified"] .sci-flow-node-actions { display: none; }
```

## Live Demo

<FeatureDemo component="CollisionDemo" />

> **Try it!** Switch collision modes (push/block/none), drag nodes to test overlap, and zoom out to see LOD transitions.
