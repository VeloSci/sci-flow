# Keyboard Shortcuts & Edge Reconnect

Customize keyboard bindings and reconnect existing edges to different ports.

## Live Demo

<FeatureDemo component="ShortcutsDemo" />

> **Try it!** View current bindings, rebind shortcuts, and press **F** to trigger fitView.

## API Reference

### Custom Keyboard Shortcuts

::: code-group
```ts [Core]
engine.plugins.shortcuts.setShortcut('delete', { key: 'Backspace' });
engine.plugins.shortcuts.setShortcut('selectAll', { key: 'a', ctrl: true });
engine.plugins.shortcuts.setShortcut('toggleGrid', { key: 'g', ctrl: true });
engine.plugins.shortcuts.onAction('toggleGrid', () => engine.plugins.snap.toggle());
```
```tsx [React]
import { useShortcuts } from '@sci-flow/react';
const { setShortcut, onAction, getAllBindings } = useShortcuts(engine);
```
```vue [Vue]
<script setup>
import { useShortcuts } from '@sci-flow/vue';
const { setShortcut, onAction } = useShortcuts(engine);
</script>
```
:::

### Edge Reconnection

::: code-group
```ts [Core]
engine.plugins.reconnect.startReconnect('edge-1', 'target');
engine.plugins.reconnect.setValidator((edge, nodeId, portId) => nodeId !== edge.source);
engine.plugins.reconnect.completeReconnect('node-3', 'input-1');
engine.plugins.reconnect.cancel();
```
```tsx [React]
import { useEdgeReconnect } from '@sci-flow/react';
const { startReconnect, completeReconnect, cancel, isReconnecting } = useEdgeReconnect(engine);
```
```vue [Vue]
<script setup>
import { useEdgeReconnect } from '@sci-flow/vue';
const { startReconnect, cancel, isReconnecting } = useEdgeReconnect(engine);
</script>
```
:::
