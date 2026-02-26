import React from 'react';

interface PaletteItem {
  type: string;
  title: string;
  color: string;
  icon: string;
  inputs: Record<string, { dataType: 'number' | 'string' | 'boolean' | 'any'; label: string }>;
  outputs: Record<string, { dataType: 'number' | 'string' | 'boolean' | 'any'; label: string }>;
}

const PALETTE_ITEMS: PaletteItem[] = [
  { type: 'generator', title: 'Source', color: '#4ecdc4', icon: '⚡',
    inputs: {}, outputs: { out1: { dataType: 'number', label: 'Value' } } },
  { type: 'processor', title: 'Transform', color: '#ff6b6b', icon: '⚙️',
    inputs: { in1: { dataType: 'number', label: 'Input' } },
    outputs: { out1: { dataType: 'number', label: 'Output' } } },
  { type: 'combiner', title: 'Merge', color: '#ffd93d', icon: '🔗',
    inputs: { in1: { dataType: 'any', label: 'A' }, in2: { dataType: 'any', label: 'B' } },
    outputs: { out1: { dataType: 'any', label: 'Result' } } },
  { type: 'viewer', title: 'Display', color: '#6c5ce7', icon: '📊',
    inputs: { in1: { dataType: 'any', label: 'Data' } }, outputs: {} },
  { type: 'multi', title: 'Advanced', color: '#00b894', icon: '🧩',
    inputs: { in1: { dataType: 'number', label: 'X' }, in2: { dataType: 'string', label: 'Y' } },
    outputs: { out1: { dataType: 'any', label: 'Result' }, out2: { dataType: 'boolean', label: 'Valid' } } },
];

/**
 * Draggable sidebar palette for external DnD into the canvas.
 */
export function NodePaletteDoc() {
  const handleDragStart = (item: PaletteItem) => (e: React.DragEvent) => {
    e.dataTransfer.setData('application/sci-flow-node', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div style={panelStyle}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>📦 Drag to Canvas</div>
      {PALETTE_ITEMS.map(item => (
        <div
          key={item.type}
          draggable
          onDragStart={handleDragStart(item)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 8px', borderRadius: 5,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${item.color}33`,
            cursor: 'grab', fontSize: 11, marginBottom: 3,
          }}
        >
          <span>{item.icon}</span>
          <span>{item.title}</span>
          <span style={{ marginLeft: 'auto', color: item.color, fontSize: 9 }}>{item.type}</span>
        </div>
      ))}
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  position: 'absolute', left: 8, top: 8, zIndex: 50,
  background: 'rgba(0,0,0,0.8)', padding: 10, borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
  width: 170, backdropFilter: 'blur(10px)', fontFamily: 'Inter, sans-serif',
};
