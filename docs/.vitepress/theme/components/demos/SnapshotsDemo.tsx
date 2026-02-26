import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type Snapshot, type Node } from '@sci-flow/core';

const INIT_NODES: Node[] = [
  { id: 'a', type: 'default', position: { x: 80, y: 80 }, data: { title: 'Alpha' }, inputs: {}, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'b', type: 'default', position: { x: 340, y: 80 }, data: { title: 'Beta' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'c', type: 'default', position: { x: 210, y: 250 }, data: { title: 'Gamma' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: {} },
];
const INIT_EDGES = [
  { id: 'e1', source: 'a', target: 'b', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e2', source: 'b', target: 'c', sourceHandle: 'output', targetHandle: 'input' },
];

function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }

interface DiffResult { added: string[]; removed: string[]; modified: string[] }

export function SnapshotsDemo(_props: { theme?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [msg, setMsg] = useState('Drag nodes then save snapshots to compare');

  useEffect(() => {
    if (!ref.current) return;
    const eng = new SciFlow({ container: ref.current });
    eng.stateManager.setNodes(deepClone(INIT_NODES));
    eng.stateManager.setEdges(deepClone(INIT_EDGES));
    setEngine(eng);
    setTimeout(() => eng.fitView(), 50);
    return () => eng.destroy();
  }, []);

  const save = useCallback(() => {
    if (!engine) return;
    const name = `v${snapshots.length + 1}`;
    engine.plugins.snapshots.createSnapshot(name);
    setSnapshots(engine.plugins.snapshots.listSnapshots());
    setMsg(`📸 Saved "${name}"`);
    setDiff(null);
  }, [engine, snapshots]);

  const restore = useCallback((id: string, name: string) => {
    if (!engine) return;
    engine.plugins.snapshots.restoreSnapshot(id);
    engine.stateManager.forceUpdate();
    engine.fitView(40);
    setMsg(`⏪ Restored "${name}"`);
    setDiff(null);
  }, [engine]);

  const doDiff = useCallback(() => {
    if (!engine || snapshots.length < 2) return;
    const a = snapshots[snapshots.length - 2];
    const b = snapshots[snapshots.length - 1];
    const d = engine.plugins.snapshots.diff(a.id, b.id);
    setDiff(d);
    setMsg(`Diff ${a.name} → ${b.name}`);
  }, [engine, snapshots]);

  return (
    <div style={{ border: '1px solid #333', borderRadius: 8, overflow: 'hidden' }}>
      <div style={BAR}>
        <button onClick={save} style={{ ...S, background: '#e17055' }}>📸 Save</button>
        {snapshots.length >= 2 && <button onClick={doDiff} style={{ ...S, background: '#fdcb6e', color: '#000' }}>🔍 Diff Last 2</button>}
        {snapshots.map(snap => (
          <button key={snap.id} onClick={() => restore(snap.id, snap.name)} style={S}>⏪ {snap.name}</button>
        ))}
        <span style={{ color: '#888', fontSize: 11, marginLeft: 'auto' }}>{msg}</span>
      </div>
      {diff && (
        <div style={{ padding: '6px 12px', background: '#16162a', display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 11, fontFamily: 'monospace' }}>
          {diff.added.map(id => <span key={id} style={{ ...CHIP, background: '#00b894' }}>+ {id}</span>)}
          {diff.removed.map(id => <span key={id} style={{ ...CHIP, background: '#d63031' }}>− {id}</span>)}
          {diff.modified.map(id => <span key={id} style={{ ...CHIP, background: '#fdcb6e', color: '#000' }}>~ {id}</span>)}
          {!diff.added.length && !diff.removed.length && !diff.modified.length && <span style={{ color: '#888' }}>No differences</span>}
        </div>
      )}
      <div ref={ref} style={{ height: 380, background: '#0d0d1a' }} />
    </div>
  );
}

const BAR: React.CSSProperties = { display: 'flex', gap: 8, padding: '8px 12px', background: '#1e1e2e', flexWrap: 'wrap', alignItems: 'center' };
const S: React.CSSProperties = { padding: '4px 10px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#333', color: '#fff', fontSize: 11, fontFamily: 'monospace' };
const CHIP: React.CSSProperties = { padding: '2px 8px', borderRadius: 3, color: '#fff' };
