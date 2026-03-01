import React from 'react';
import { Zap, Settings2, Link as LinkIcon, BarChart2, Blocks, PackagePlus } from 'lucide-react';

interface PaletteItem {
  type: string;
  title: string;
  color: string;
  icon: React.ReactNode;
  inputs: Record<string, { dataType: 'number' | 'string' | 'boolean' | 'any'; label: string }>;
  outputs: Record<string, { dataType: 'number' | 'string' | 'boolean' | 'any'; label: string }>;
}

const PALETTE_ITEMS: PaletteItem[] = [
  { type: 'generator', title: 'Source', color: '#4ecdc4', icon: <Zap size={14}/>,
    inputs: {}, outputs: { out1: { dataType: 'number', label: 'Value' } } },
  { type: 'processor', title: 'Transform', color: '#ff6b6b', icon: <Settings2 size={14}/>,
    inputs: { in1: { dataType: 'number', label: 'Input' } },
    outputs: { out1: { dataType: 'number', label: 'Output' } } },
  { type: 'combiner', title: 'Merge', color: '#ffd93d', icon: <LinkIcon size={14}/>,
    inputs: { in1: { dataType: 'any', label: 'A' }, in2: { dataType: 'any', label: 'B' } },
    outputs: { out1: { dataType: 'any', label: 'Result' } } },
  { type: 'viewer', title: 'Display', color: '#6c5ce7', icon: <BarChart2 size={14}/>,
    inputs: { in1: { dataType: 'any', label: 'Data' } }, outputs: {} },
  { type: 'multi', title: 'Advanced', color: '#00b894', icon: <Blocks size={14}/>,
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
    <div className="absolute left-2 top-2 z-[50] bg-black/80 p-2.5 rounded-md border border-white/10 text-white w-[170px] backdrop-blur-md font-sans">
      <div className="text-xs font-semibold mb-1.5 flex items-center gap-1.5"><PackagePlus size={14} className="text-emerald-400" /> Drag to Canvas</div>
      {PALETTE_ITEMS.map(item => (
        <div
          key={item.type}
          draggable
          onDragStart={handleDragStart(item)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/5 border cursor-grab text-[11px] mb-1 hover:bg-white/10 transition-colors"
          style={{ borderColor: `${item.color}33` }}
        >
          <span className="flex items-center justify-center text-current opacity-80">{item.icon}</span>
          <span>{item.title}</span>
          <span className="ml-auto text-[9px]" style={{ color: item.color }}>{item.type}</span>
        </div>
      ))}
    </div>
  );
}
