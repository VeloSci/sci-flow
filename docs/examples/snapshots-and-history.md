# Snapshots & History Persistence

Save named snapshots, compare versions, and persist undo/redo history.

## Live Demo

<FeatureDemo component="SnapshotsDemo" />

> **Try it!** Save a snapshot, move nodes, save another, then restore or diff them.

## API Reference

::: code-group
```ts [Core - Snapshots]
const s1 = engine.plugins.snapshots.createSnapshot('v1');
const s2 = engine.plugins.snapshots.createSnapshot('v2');
const diff = engine.plugins.snapshots.diff(s1.id, s2.id);
engine.plugins.snapshots.restoreSnapshot(s1.id);
engine.plugins.snapshots.listSnapshots();
```
```ts [Core - History Persistence]
engine.plugins.historyPersistence.enableAutoSave();
engine.plugins.historyPersistence.save();
engine.plugins.historyPersistence.restore();
```
```tsx [React]
import { useSnapshots } from '@sci-flow/react';
const { createSnapshot, restoreSnapshot, diff, listSnapshots } = useSnapshots(engine);
```
```vue [Vue]
<script setup>
import { useSnapshots } from '@sci-flow/vue';
const { createSnapshot, restoreSnapshot, listSnapshots } = useSnapshots(engine);
</script>
```
:::
