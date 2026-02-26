import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type Node } from '@sci-flow/core';
import type { LayoutAlgorithm } from '@sci-flow/core';

const NODES: Node[] = [
  { id: 'a', type: 'default', position: { x: 50, y: 50 }, data: { title: 'Source' }, inputs: {}, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'b', type: 'default', position: { x: 300, y: 50 }, data: { title: 'Transform' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'c', type: 'default', position: { x: 150, y: 200 }, data: { title: 'Validate' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'd', type: 'default', position: { x: 400, y: 200 }, data: { title: 'Format' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'e', type: 'default', position: { x: 250, y: 350 }, data: { title: 'Export' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: {} },
];
const EDGES = [
  { id: 'e1', source: 'a', target: 'b', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e2', source: 'b', target: 'c', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e3', source: 'b', target: 'd', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e4', source: 'c', target: 'e', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e5', source: 'd', target: 'e', sourceHandle: 'output', targetHandle: 'input' },
];

export function LayoutDemo(_props: { theme?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [current, setCurrent] = useState('—');

  useEffect(() => {
    if (!containerRef.current) return;
    const eng = new SciFlow({ container: containerRef.current });
    eng.stateManager.setNodes(NODES.map(n => ({ ...n })));
    eng.stateManager.setEdges(EDGES.map(ed => ({ ...ed })));
    setEngine(eng);
    return () => eng.destroy();
  }, []);

  const apply = useCallback((algo: LayoutAlgorithm, dir?: string) => {
    if (!engine) return;
    const positions = engine.plugins.layout.computeLayout(algo, { direction: dir as 'TB' | 'LR', nodeSpacing: 220, rankSpacing: 160 });
    engine.plugins.layout.applyLayout(positions);
    engine.stateManager.forceUpdate();
    setCurrent(algo + (dir ? ` (${dir})` : ''));
  }, [engine]);

  return (
    <div style={{ border: '1px solid #333', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', background: '#1e1e2e', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => apply('dagre', 'TB')} style={S}>Dagre ↓</button>
        <button onClick={() => apply('dagre', 'LR')} style={S}>Dagre →</button>
        <button onClick={() => apply('force')} style={S}>Force</button>
        <button onClick={() => apply('grid')} style={S}>Grid</button>
        <button onClick={() => apply('radial')} style={S}>Radial</button>
        <span style={{ color: '#888', fontSize: 11, marginLeft: 'auto' }}>Layout: {current}</span>
      </div>
      <div ref={containerRef} style={{ height: 400, background: '#0d0d1a' }} />
    </div>
  );
}

const S: React.CSSProperties = { padding: '4px 12px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#6c5ce7', color: '#fff', fontSize: 12, fontFamily: 'monospace' };
