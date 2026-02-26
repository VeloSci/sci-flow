# Snap-to-Grid & Helper Lines

Snap node positions to a configurable grid and show alignment guides when dragging.

## Live Demo

<FeatureDemo component="SnapDemo" />

> **Try it!** Toggle snap on/off, change grid size (10/20/50px), drag nodes, then click **Snap All** to align.

## API Reference

::: code-group
```ts [Core]
engine.plugins.snap.snapAll();        // snap all nodes
engine.plugins.snap.setGridSize(50);  // change grid
engine.plugins.snap.toggle();         // enable/disable
engine.plugins.snap.snapNode('n1');   // snap single node
```
```tsx [React]
import { useSnap } from '@sci-flow/react';
const { snapAll, setGridSize, toggle, isEnabled } = useSnap(engine);
```
```vue [Vue]
<script setup>
import { useSnap } from '@sci-flow/vue';
const { snapAll, setGridSize, toggle } = useSnap(engine);
</script>
```
:::

## Helper Lines (Alignment Guides)

```ts
// Called during drag — returns snap-corrected position + visual lines
const { snapX, snapY, lines } = engine.plugins.helperLines
  .computeHelperLines('node-1', x, y);

const activeLines = engine.plugins.helperLines.getActiveLines();
engine.plugins.helperLines.clearLines();
```
