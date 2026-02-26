import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type Node } from '@sci-flow/core';

const INIT_NODES: Node[] = [
  { id: 'n1', type: 'default', position: { x: 60, y: 60 }, data: { title: 'Input' }, inputs: {}, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'n2', type: 'default', position: { x: 320, y: 60 }, data: { title: 'Filter' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'n3', type: 'default', position: { x: 185, y: 260 }, data: { title: 'Output' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: {} },
];
const INIT_EDGES = [
  { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'output', targetHandle: 'input' },
];

function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }

export function SnapDemo(_props: { theme?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [gridSize, setGridSize] = useState(20);
  const [snapOn, setSnapOn] = useState(true);

  useEffect(() => {
    if (!ref.current) return;
    const e = new SciFlow({ container: ref.current, plugins: { snapOptions: { gridSize } } });
    e.stateManager.setNodes(deepClone(INIT_NODES));
    e.stateManager.setEdges(deepClone(INIT_EDGES));
    setEngine(e);
    setTimeout(() => e.fitView(), 50);
    return () => e.destroy();
  }, []);

  const handleSnap = useCallback(() => {
    engine?.plugins.snap.snapAll();
    engine?.stateManager.forceUpdate();
  }, [engine]);

  const handleToggle = useCallback(() => {
    engine?.plugins.snap.toggle();
    setSnapOn(engine?.plugins.snap.enabled ?? false);
  }, [engine]);

  const handleGrid = useCallback((size: number) => {
    engine?.plugins.snap.setGridSize(size);
    setGridSize(size);
  }, [engine]);

  return (
    <div style={WRAPPER}>
      <div style={BAR}>
        <button onClick={handleToggle} style={S}>Snap: {snapOn ? '✅ ON' : '❌ OFF'}</button>
        {[10, 20, 50].map(s => (
          <button key={s} onClick={() => handleGrid(s)} style={{ ...S, background: gridSize === s ? 'var(--vp-c-brand)' : 'var(--sci-surface-1)', color: gridSize === s ? '#fff' : 'var(--sci-text-primary)' }}>{s}px</button>
        ))}
        <button onClick={handleSnap} style={{ ...S, background: 'var(--sci-accent-blue)', color: '#fff' }}>Snap All ⬡</button>
      </div>
      <div ref={ref} style={CANVAS} />
    </div>
  );
}

const WRAPPER: React.CSSProperties = { border: '1px solid var(--sci-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--sci-surface-1)', boxShadow: 'var(--sci-glass-shadow)' };
const BAR: React.CSSProperties = { display: 'flex', gap: 8, padding: '10px 14px', background: 'var(--sci-surface-2)', borderBottom: '1px solid var(--sci-border)', flexWrap: 'wrap', alignItems: 'center' };
const S: React.CSSProperties = { padding: '6px 14px', border: '1px solid var(--sci-border)', borderRadius: 6, cursor: 'pointer', background: 'var(--sci-surface-1)', color: 'var(--sci-text-primary)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const CANVAS: React.CSSProperties = { height: 400, background: 'var(--sci-surface-1)' };

