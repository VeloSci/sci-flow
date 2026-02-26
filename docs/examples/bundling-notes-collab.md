# Edge Bundling, Sticky Notes & Collaborative Editing

Bundle parallel edges, add free-floating annotations, and collaborate in real-time.

## Live Demo

<FeatureDemo component="NotesDemo" />

> **Try it!** Add colorful sticky notes, detect parallel edge bundles, and clear them.

## API Reference

### Edge Bundling

```ts
engine.plugins.edgeBundler.detectBundles();
const bundles = engine.plugins.edgeBundler.getBundles();
engine.plugins.edgeBundler.toggleBundle('nodeA|nodeB');
engine.plugins.edgeBundler.getEdgeOffset('e1');
engine.plugins.edgeBundler.isBundled('e1');
```

### Sticky Notes

```ts
const note = engine.plugins.stickyNotes.add('TODO', 300, 200, '#ffd93d');
engine.plugins.stickyNotes.update(note.id, { text: 'Done!', color: '#95e1d3' });
engine.plugins.stickyNotes.move(note.id, 400, 300);
engine.plugins.stickyNotes.togglePin(note.id);
engine.plugins.stickyNotes.getAll();
engine.plugins.stickyNotes.clear();
```

### Collaborative Editing (CRDT)

```ts
engine.plugins.collab.emitOperation({
  type: 'move_node', nodeId: 'n1',
  position: { x: 100, y: 200 }, userId: 'user-A',
});
engine.plugins.collab.onOperation((op) => { /* handle remote */ });
engine.plugins.collab.updatePresence('user-A', { x: 500, y: 300 }, 'Alice', '#ff6b6b');
engine.plugins.collab.getPresences();
```
