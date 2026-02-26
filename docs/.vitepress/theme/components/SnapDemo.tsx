import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type Node } from '@sci-flow/core';

const NODES: Node[] = [
  { id: 'n1', type: 'default', position: { x: 60, y: 60 }, data: { title: 'Input' }, inputs: {}, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'n2', type: 'default', position: { x: 320, y: 60 }, data: { title: 'Filter' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'n3', type: 'default', position: { x: 185, y: 260 }, data: { title: 'Output' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: {} },
];
const EDGES = [
  { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'output', targetHandle: 'input' },
];

export function SnapDemo(_props: { theme?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [gridSize, setGridSize] = useState(20);
  const [snapOn, setSnapOn] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const e = new SciFlow({ container: containerRef.current, plugins: { snapOptions: { gridSize } } });
    e.stateManager.setNodes(NODES.map(n => ({ ...n })));
    e.stateManager.setEdges(EDGES.map(ed => ({ ...ed })));
    setEngine(e);
    return () => e.destroy();
  }, []);

  const handleSnap = useCallback(() => { engine?.plugins.snap.snapAll(); engine?.stateManager.forceUpdate(); }, [engine]);
  const handleToggle = useCallback(() => { engine?.plugins.snap.toggle(); setSnapOn(engine?.plugins.snap.enabled ?? false); }, [engine]);
  const handleGrid = useCallback((size: number) => { engine?.plugins.snap.setGridSize(size); setGridSize(size); }, [engine]);

  return (
    <div style={{ border: '1px solid #333', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', background: '#1e1e2e', flexWrap: 'wrap' }}>
        <button onClick={handleToggle} style={S}>Snap: {snapOn ? '✅ ON' : '❌ OFF'}</button>
        {[10, 20, 50].map(s => (
          <button key={s} onClick={() => handleGrid(s)} style={{ ...S, background: gridSize === s ? '#4ecdc4' : '#333', color: gridSize === s ? '#000' : '#fff' }}>{s}px</button>
        ))}
        <button onClick={handleSnap} style={{ ...S, background: '#6c5ce7' }}>Snap All ⬡</button>
      </div>
      <div ref={containerRef} style={{ height: 400, background: '#0d0d1a' }} />
    </div>
  );
}

const S: React.CSSProperties = { padding: '4px 12px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#333', color: '#fff', fontSize: 12, fontFamily: 'monospace' };
