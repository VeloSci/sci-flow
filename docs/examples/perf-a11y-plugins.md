# Performance Monitor, Accessibility & Plugin API

Built-in FPS overlay, WCAG 2.1 accessibility, and third-party plugin system.

## Live Demo

<FeatureDemo component="PerfDemo" />

> **Try it!** Toggle the FPS monitor, apply ARIA labels, enable high contrast, or tab between nodes.

## API Reference

### Performance Monitor

::: code-group
```ts [Core]
engine.plugins.perfMonitor.show();
engine.plugins.perfMonitor.toggle();
engine.plugins.perfMonitor.getFPS();
```
```tsx [React]
import { usePerfMonitor } from '@sci-flow/react';
const { show, toggle, getFPS, isVisible } = usePerfMonitor(engine);
```
:::

### Accessibility

```ts
engine.plugins.a11y.updateLabels();         // apply ARIA labels
engine.plugins.a11y.focusNode('next');       // keyboard navigation
engine.plugins.a11y.toggleHighContrast();    // high contrast mode
engine.plugins.a11y.announce('Deleted!');    // screen reader
```

### Plugin API

```ts
engine.plugins.pluginAPI.use({
  name: 'my-logger',
  version: '1.0.0',
  onInit: () => console.log('Init'),
  onStateChange: () => console.log('Changed'),
  onDestroy: () => console.log('Destroyed'),
});
engine.plugins.pluginAPI.listPlugins();
engine.plugins.pluginAPI.hasPlugin('my-logger');
```
