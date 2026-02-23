# Complex Ports Example

In scientific instrumentation, nodes often represent complex devices with multiple sensors, triggers, and data channels. `sci-flow` handles high-density port configurations with ease.

<InteractiveFlow 
  title="Multi-Channel Analyzer"
  :nodes="[
    { 
      id: 'mca', 
      type: 'default', 
      position: { x: 200, y: 50 }, 
      data: { label: '8-Channel ADC' }, 
      inputs: { 
        trig: { label: 'Trigger' },
        clock: { label: 'Clock' }
      },
      outputs: { 
        ch1: { label: 'CH 1' },
        ch2: { label: 'CH 2' },
        ch3: { label: 'CH 3' },
        ch4: { label: 'CH 4' },
        ch5: { label: 'CH 5' },
        ch6: { label: 'CH 6' },
        ch7: { label: 'CH 7' },
        ch8: { label: 'CH 8' }
      },
      style: { width: 180, height: 260 }
    }
  ]"
  :edges="[]"
  height="400px"
/>

## Dynamic Port Layout

The `NodeManager` automatically distributes ports along the sides of the node. When a node has multiple ports, they are spaced evenly based on the node's height (for left/right ports) or width (for top/bottom ports).

### Customizing Node Size

For nodes with many ports, you should increase the `style.width` and `style.height` to ensure all labels are readable:

```typescript
const largeNode = {
  id: 'adc-1',
  data: { label: '8-Channel ADC' },
  style: {
    width: 200,
    height: 300 // Ample space for the ports
  },
  // ...
}
```

### Port Identification

Every port has a unique ID within its node. This ID is used for edge connections:

```typescript
engine.addEdge({
  id: 'e1',
  source: 'mca',
  sourceHandle: 'ch1', // Matches the key in outputs
  target: 'filter-1',
  targetHandle: 'in'
});
```

The combination of `nodeId` and `portId` (sourceHandle/targetHandle) ensures that every connection is precise and uniquely identifiable.
