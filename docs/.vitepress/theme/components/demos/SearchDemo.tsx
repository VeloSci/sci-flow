import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type Node } from '@sci-flow/core';

const INIT_NODES: Node[] = [
  { id: 'src', type: 'default', position: { x: 50, y: 80 }, data: { title: 'DataSource' }, inputs: {}, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'filter', type: 'default', position: { x: 280, y: 30 }, data: { title: 'FilterNode' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'map', type: 'default', position: { x: 280, y: 180 }, data: { title: 'MapTransform' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'reduce', type: 'default', position: { x: 510, y: 80 }, data: { title: 'ReduceAgg' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'out', type: 'default', position: { x: 510, y: 250 }, data: { title: 'Output' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: {} },
];
const INIT_EDGES = [
  { id: 'e1', source: 'src', target: 'filter', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e2', source: 'src', target: 'map', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e3', source: 'filter', target: 'reduce', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e4', source: 'map', target: 'out', sourceHandle: 'output', targetHandle: 'input' },
];

function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }

export function SearchDemo(_props: { theme?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ nodeId: string; matchField: string; matchValue: string }[]>([]);

  useEffect(() => {
    if (!ref.current) return;
    const eng = new SciFlow({ container: ref.current });
    eng.stateManager.setNodes(deepClone(INIT_NODES));
    eng.stateManager.setEdges(deepClone(INIT_EDGES));
    setEngine(eng);
    setTimeout(() => eng.fitView(), 50);
    return () => eng.destroy();
  }, []);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (!engine) return;
    setResults(engine.plugins.search.search(q));
  }, [engine]);

  const handleZoom = useCallback((nodeId: string) => {
    if (!engine) return;
    const vp = engine.plugins.zoomToSelection.zoomToSelection([nodeId], 80);
    if (vp) engine.stateManager.setViewport(vp);
  }, [engine]);

  const handleClear = useCallback(() => {
    setQuery(''); setResults([]);
    engine?.plugins.search.clearHighlights();
    engine?.fitView(40);
  }, [engine]);

  return (
    <div style={WRAPPER}>
      <div style={BAR}>
        <input value={query} onChange={e => handleSearch(e.target.value)} placeholder="Search nodes..."
          style={{ flex: 1, padding: '6px 12px', background: 'var(--sci-surface-1)', border: '1px solid var(--sci-border)', borderRadius: 6, color: 'var(--sci-text-primary)', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
        <button onClick={handleClear} style={S}>Clear</button>
        <span style={{ color: 'var(--sci-text-secondary)', fontSize: 13, minWidth: 60, textAlign: 'right' }}>{results.length} found</span>
      </div>
      {results.length > 0 && (
        <div style={{ padding: '8px 14px', background: 'var(--sci-surface-3)', borderBottom: '1px solid var(--sci-border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {results.map(r => (
            <button key={r.nodeId} onClick={() => handleZoom(r.nodeId)} style={{ ...S, background: 'var(--sci-surface-1)', borderColor: 'var(--vp-c-brand)' }}>🔍 {r.matchValue || r.nodeId}</button>
          ))}
        </div>
      )}
      <div ref={ref} style={CANVAS} />
    </div>
  );
}

const WRAPPER: React.CSSProperties = { border: '1px solid var(--sci-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--sci-surface-1)', boxShadow: 'var(--sci-glass-shadow)' };
const BAR: React.CSSProperties = { display: 'flex', gap: 8, padding: '10px 14px', background: 'var(--sci-surface-2)', borderBottom: '1px solid var(--sci-border)', alignItems: 'center' };
const S: React.CSSProperties = { padding: '6px 14px', border: '1px solid var(--sci-border)', borderRadius: 6, cursor: 'pointer', background: 'var(--sci-surface-1)', color: 'var(--sci-text-primary)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const CANVAS: React.CSSProperties = { height: 380, background: 'var(--sci-surface-1)' };
