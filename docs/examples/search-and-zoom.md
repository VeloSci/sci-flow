# Search, Filter & Zoom

Find nodes by type or content and zoom viewport to fit selections.

## Live Demo

<FeatureDemo component="SearchDemo" />

> **Try it!** Type `filter`, `map`, or `reduce` in the search box. Click a result to zoom to it.

## API Reference

::: code-group
```ts [Core]
const results = engine.plugins.search.search('filter');
engine.plugins.search.filterByType('processor');
engine.plugins.search.clearHighlights();

// Zoom to specific nodes
const vp = engine.plugins.zoomToSelection.zoomToSelection(['n1', 'n2'], 50);
engine.plugins.zoomToSelection.zoomToSelected();
```
```tsx [React]
import { useSearch, useZoomToSelection } from '@sci-flow/react';
const { search, results, clearHighlights } = useSearch(engine);
const { zoomToSelection, zoomToSelected } = useZoomToSelection(engine);
```
```vue [Vue]
<script setup>
import { useSearch, useZoomToSelection } from '@sci-flow/vue';
const { search, results } = useSearch(engine);
const { zoomToSelection } = useZoomToSelection(engine);
</script>
```
:::
