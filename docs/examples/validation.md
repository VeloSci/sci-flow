# Validation & Colors Example

`sci-flow` supports typed ports, allowing you to visually distinguish between different data types (e.g., Number, String, Boolean) and prevent invalid connections.

<InteractiveFlow 
  title="Data Type Validation"
  :nodes="[
    { 
      id: 'src', 
      type: 'default', 
      position: { x: 50, y: 50 }, 
      data: { label: 'Signal Source' }, 
      outputs: { 
        num: { label: 'Value', dataType: 'number' },
        msg: { label: 'Status', dataType: 'string' }
      } 
    },
    { 
      id: 'proc', 
      type: 'default', 
      position: { x: 350, y: 50 }, 
      data: { label: 'Comparator' }, 
      inputs: { 
        val: { label: 'In', dataType: 'number' }
      } 
    }
  ]"
  :edges="[
    { id: 'e1', source: 'src', sourceHandle: 'num', target: 'proc', targetHandle: 'val' }
  ]"
  height="300px"
/>

## Visual Indicators

Ports are automatically color-coded based on their `dataType`. This follows a scientific instrumentation standard for quick visual recognition of data streams.

| Data Type | Color | Hex Code |
| --- | --- | --- |
| `number` | Grey | `#a1a1a1` |
| `string` | Blue | `#45a3e5` |
| `boolean` | Red | `#cc7070` |
| `object` | Purple | `#8b5cf6` |
| `any` | Yellow | `#e3b034` |

## Implementation

To enable typed ports, add the `dataType` property to your port definitions:

```typescript
const node = {
  id: 'sensor-1',
  outputs: {
    temp: { 
      label: 'Temperature', 
      dataType: 'number' // Applied automatically
    }
  }
};
```

## Validation Logic

When a user attempts to connect two ports, `sci-flow` checks for compatibility:

1. **Exact Match**: If both ports have the same `dataType`, the connection is allowed.
2. **`any` Type**: Ports marked as `any` can connect to any other port.
3. **Mismatched Types**: If types don't match (e.g., connecting a `string` output to a `number` input), the connection is rejected, and the edge snaps back.

This validation ensures the integrity of your data pipeline before any processing takes place.
