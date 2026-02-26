import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type Node } from '@sci-flow/core';

const NODES: Node[] = [
  { id: 'src', type: 'default', position: { x: 50, y: 80 }, data: { title: 'DataSource' }, inputs: {}, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'filter', type: 'default', position: { x: 280, y: 30 }, data: { title: 'FilterNode' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'map', type: 'default', position: { x: 280, y: 180 }, data: { title: 'MapTransform' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'reduce', type: 'default', position: { x: 510, y: 80 }, data: { title: 'ReduceAgg' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'out', type: 'default', position: { x: 510, y: 250 }, data: { title: 'Output' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: {} },
];
const EDGES = [
  { id: 'e1', source: 'src', target: 'filter', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e2', source: 'src', target: 'map', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e3', source: 'filter', target: 'reduce', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e4', source: 'map', target: 'out', sourceHandle: 'output', targetHandle: 'input' },
];

export function SearchDemo(_props: { theme?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ nodeId: string; matchField: string; matchValue: string }[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const eng = new SciFlow({ container: containerRef.current });
    eng.stateManager.setNodes(NODES.map(n => ({ ...n })));
    eng.stateManager.setEdges(EDGES.map(ed => ({ ...ed })));
    setEngine(eng);
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

  const handleClear = useCallback(() => { setQuery(''); setResults([]); engine?.plugins.search.clearHighlights(); }, [engine]);

  return (
    <div style={{ border: '1px solid #333', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', background: '#1e1e2e', alignItems: 'center' }}>
        <input value={query} onChange={e => handleSearch(e.target.value)} placeholder="Search nodes... (try 'filter' or 'map')"
          style={{ flex: 1, padding: '4px 8px', background: '#2a2a3e', border: '1px solid #444', borderRadius: 4, color: '#fff', fontSize: 12, fontFamily: 'monospace' }} />
        <button onClick={handleClear} style={S}>Clear</button>
        <span style={{ color: '#4ecdc4', fontSize: 11 }}>{results.length} found</span>
      </div>
      {results.length > 0 && (
        <div style={{ padding: '4px 12px', background: '#16162a', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {results.map(r => (
            <button key={r.nodeId} onClick={() => handleZoom(r.nodeId)} style={{ ...S, background: '#4ecdc4', color: '#000' }}>🔍 {r.matchValue || r.nodeId}</button>
          ))}
        </div>
      )}
      <div ref={containerRef} style={{ height: 380, background: '#0d0d1a' }} />
    </div>
  );
}

const S: React.CSSProperties = { padding: '4px 10px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#333', color: '#fff', fontSize: 11, fontFamily: 'monospace' };
