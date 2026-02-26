import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type Snapshot, type Node } from '@sci-flow/core';

const NODES: Node[] = [
  { id: 'a', type: 'default', position: { x: 80, y: 80 }, data: { title: 'Alpha' }, inputs: {}, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'b', type: 'default', position: { x: 340, y: 80 }, data: { title: 'Beta' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'c', type: 'default', position: { x: 210, y: 250 }, data: { title: 'Gamma' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: {} },
];
const EDGES = [
  { id: 'e1', source: 'a', target: 'b', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e2', source: 'b', target: 'c', sourceHandle: 'output', targetHandle: 'input' },
];

export function SnapshotsDemo(_props: { theme?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!containerRef.current) return;
    const eng = new SciFlow({ container: containerRef.current });
    eng.stateManager.setNodes(NODES.map(n => ({ ...n })));
    eng.stateManager.setEdges(EDGES.map(ed => ({ ...ed })));
    setEngine(eng);
    return () => eng.destroy();
  }, []);

  const save = useCallback(() => {
    if (!engine) return;
    const name = `v${snapshots.length + 1}`;
    engine.plugins.snapshots.createSnapshot(name);
    setSnapshots(engine.plugins.snapshots.listSnapshots());
    setMsg(`📸 Saved "${name}"`);
  }, [engine, snapshots]);

  const restore = useCallback((id: string, name: string) => {
    if (!engine) return;
    engine.plugins.snapshots.restoreSnapshot(id);
    engine.stateManager.forceUpdate();
    setMsg(`⏪ Restored "${name}"`);
  }, [engine]);

  const doDiff = useCallback(() => {
    if (!engine || snapshots.length < 2) return;
    const a = snapshots[snapshots.length - 2];
    const b = snapshots[snapshots.length - 1];
    const d = engine.plugins.snapshots.diff(a.id, b.id);
    setMsg(`Diff ${a.name}→${b.name}: +${d.added.length} -${d.removed.length} ~${d.modified.length}`);
  }, [engine, snapshots]);

  return (
    <div style={{ border: '1px solid #333', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', background: '#1e1e2e', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={save} style={{ ...S, background: '#e17055' }}>📸 Save Snapshot</button>
        {snapshots.length >= 2 && <button onClick={doDiff} style={{ ...S, background: '#fdcb6e', color: '#000' }}>🔍 Diff Last 2</button>}
        {snapshots.map(snap => (
          <button key={snap.id} onClick={() => restore(snap.id, snap.name)} style={S}>⏪ {snap.name}</button>
        ))}
        {msg && <span style={{ color: '#4ecdc4', fontSize: 11, marginLeft: 'auto' }}>{msg}</span>}
      </div>
      <div ref={containerRef} style={{ height: 380, background: '#0d0d1a' }} />
    </div>
  );
}

const S: React.CSSProperties = { padding: '4px 10px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#333', color: '#fff', fontSize: 11, fontFamily: 'monospace' };
