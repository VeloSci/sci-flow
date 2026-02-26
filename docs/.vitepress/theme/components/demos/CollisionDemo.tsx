import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type Node } from '@sci-flow/core';
import type { CollisionMode } from '@sci-flow/core';

const INIT_NODES: Node[] = [
  { id: 'n1', type: 'default', position: { x: 60, y: 60 }, data: { title: 'Node A' }, inputs: {}, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'n2', type: 'default', position: { x: 300, y: 60 }, data: { title: 'Node B' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'n3', type: 'default', position: { x: 60, y: 260 }, data: { title: 'Node C' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'n4', type: 'default', position: { x: 300, y: 260 }, data: { title: 'Node D' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: {} },
];
const INIT_EDGES = [
  { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e2', source: 'n1', target: 'n3', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e3', source: 'n2', target: 'n4', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e4', source: 'n3', target: 'n4', sourceHandle: 'output', targetHandle: 'input' },
];

function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }

export function CollisionDemo(_props: { theme?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [mode, setMode] = useState<CollisionMode>('none');
  const [overlaps, setOverlaps] = useState(0);
  const [lod, setLod] = useState('full');

  useEffect(() => {
    if (!ref.current) return;
    const eng = new SciFlow({ container: ref.current });
    eng.stateManager.setNodes(deepClone(INIT_NODES));
    eng.stateManager.setEdges(deepClone(INIT_EDGES));
    setEngine(eng);
    setTimeout(() => eng.fitView(), 50);

    // Monitor LOD changes
    eng.plugins.lod?.onLevelChange?.((level: string) => setLod(level));
    return () => eng.destroy();
  }, []);

  const switchMode = useCallback((m: CollisionMode) => {
    if (!engine) return;
    engine.plugins.collision.mode = m;
    setMode(m);
  }, [engine]);

  const checkOverlaps = useCallback(() => {
    if (!engine) return;
    const pairs = engine.plugins.collision.getOverlappingPairs();
    setOverlaps(pairs.length);
  }, [engine]);

  return (
    <div style={WRAPPER}>
      <div style={BAR}>
        <span style={{ color: 'var(--sci-text-muted)', fontSize: 13, marginRight: 4 }}>Collision:</span>
        {(['none', 'push', 'block'] as CollisionMode[]).map(m => (
          <button key={m} onClick={() => switchMode(m)} style={{ ...S, background: mode === m ? 'var(--vp-c-brand)' : 'var(--sci-surface-1)', color: mode === m ? '#fff' : 'var(--sci-text-primary)' }}>{m}</button>
        ))}
        <button onClick={checkOverlaps} style={{ ...S, background: 'var(--sci-accent-blue)', color: '#fff', marginLeft: 8 }}>Check Overlaps</button>
        <span style={{ color: 'var(--sci-text-primary)', fontSize: 13, fontWeight: 500, marginLeft: 'auto' }}>
          Overlaps: <span style={{ color: 'var(--sci-accent-blue)' }}>{overlaps}</span> | LOD: <span style={{ color: 'var(--vp-c-brand)' }}>{lod}</span>
        </span>
      </div>
      <div style={{ padding: '10px 14px', background: 'var(--sci-surface-3)', borderBottom: '1px solid var(--sci-border)', color: 'var(--sci-text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
        💡 Drag nodes to test collision. Zoom out to see LOD levels change (full → simplified → dot)
      </div>
      <div ref={ref} style={CANVAS} />
    </div>
  );
}

const WRAPPER: React.CSSProperties = { border: '1px solid var(--sci-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--sci-surface-1)', boxShadow: 'var(--sci-glass-shadow)' };
const BAR: React.CSSProperties = { display: 'flex', gap: 8, padding: '10px 14px', background: 'var(--sci-surface-2)', borderBottom: '1px solid var(--sci-border)', flexWrap: 'wrap', alignItems: 'center' };
const S: React.CSSProperties = { padding: '6px 14px', border: '1px solid var(--sci-border)', borderRadius: 6, cursor: 'pointer', background: 'var(--sci-surface-1)', color: 'var(--sci-text-primary)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const CANVAS: React.CSSProperties = { height: 360, background: 'var(--sci-surface-1)' };
