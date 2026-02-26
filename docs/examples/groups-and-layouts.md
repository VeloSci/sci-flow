# Node Grouping & Auto Layouts

Group nodes into sub-graphs and auto-arrange with layout algorithms.

## Groups Demo

<FeatureDemo component="GroupsDemo" />

> **Try it!** Click **Group Pipeline** to group nodes, then **Collapse** or **Move** the group.

## Layout Demo

<FeatureDemo component="LayoutDemo" />

> **Try it!** Click each layout button (Dagre, Force, Grid, Radial) to see auto-arrangement.

## API Reference

::: code-group
```ts [Core - Groups]
const g = engine.plugins.groups.createGroup('Team', ['n1', 'n2'], '#4ecdc4');
engine.plugins.groups.toggleCollapse(g.id);
engine.plugins.groups.moveGroup(g.id, 100, 0);
engine.plugins.groups.getGroupBounds(g.id);
```
```ts [Core - Layout]
engine.plugins.layout.computeLayout('dagre', { direction: 'TB' });
// algorithms: 'dagre' | 'force' | 'grid' | 'radial'
```
```tsx [React]
import { useGroups, useLayout } from '@sci-flow/react';
const { createGroup, toggleCollapse } = useGroups(engine);
const { applyLayout } = useLayout(engine);
```
```vue [Vue]
<script setup>
import { useGroups, useLayout } from '@sci-flow/vue';
const { createGroup } = useGroups(engine);
const { applyLayout } = useLayout(engine);
</script>
```
:::
