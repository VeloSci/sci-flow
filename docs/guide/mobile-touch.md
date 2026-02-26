---
layout: doc
title: Mobile & Touch Support
---

# Mobile & Touch Support

`sci-flow` includes comprehensive mobile support via the `TouchManager` plugin, auto-detected on touch devices.

## Features

### Pinch-to-Zoom
Multi-touch zoom centered on the gesture midpoint with simultaneous two-finger panning.

```typescript
// Automatically handled by TouchManager
engine.plugins.touch.getIsTouchDevice(); // true on mobile
```

### Tap-to-Connect
Connect ports by tapping:
1. **Tap** source port → port highlights with pulse animation
2. **Tap** target port → connection created
3. **Tap** anywhere else → cancel

```typescript
engine.plugins.touch.setTapConnectHandler((source, target) => {
  console.log(`Connected ${source.nodeId}:${source.portId} → ${target.nodeId}:${target.portId}`);
});
```

### Double-Tap to Fit View
Double-tap the canvas background to fit all nodes in view.

```typescript
engine.plugins.touch.setDoubleTapHandler(() => {
  engine.fitView(50);
});
```

### Responsive Touch Targets
Ports automatically enlarge to **44px+** on touch devices (WCAG compliant). Edge hit areas also expand to 30px.

### Long-Press Context Menu
Detect long-press gestures for context menus:

```typescript
const detector = engine.plugins.touch.createLongPressDetector((e) => {
  showContextMenu(e.clientX, e.clientY);
});
```

## CSS Classes

| Selector | Effect |
|----------|--------|
| `[data-touch-device="true"]` | Applied to container on touch devices |
| `.sci-flow-port-source-staged` | Pulsing port during tap-to-connect |
