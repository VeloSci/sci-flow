import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type Node } from '@sci-flow/core';
import type { LayoutAlgorithm } from '@sci-flow/core';

const INIT_NODES: Node[] = [
  { id: 'a', type: 'default', position: { x: 50, y: 50 }, data: { title: 'Source' }, inputs: {}, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'b', type: 'default', position: { x: 300, y: 50 }, data: { title: 'Transform' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'c', type: 'default', position: { x: 150, y: 200 }, data: { title: 'Validate' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'd', type: 'default', position: { x: 400, y: 200 }, data: { title: 'Format' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'e', type: 'default', position: { x: 250, y: 350 }, data: { title: 'Export' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: {} },
];
const INIT_EDGES = [
  { id: 'e1', source: 'a', target: 'b', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e2', source: 'b', target: 'c', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e3', source: 'b', target: 'd', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e4', source: 'c', target: 'e', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e5', source: 'd', target: 'e', sourceHandle: 'output', targetHandle: 'input' },
];

function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }

export function LayoutDemo(_props: { theme?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [current, setCurrent] = useState('original');

  useEffect(() => {
    if (!ref.current) return;
    const eng = new SciFlow({ container: ref.current });
    eng.stateManager.setNodes(deepClone(INIT_NODES));
    eng.stateManager.setEdges(deepClone(INIT_EDGES));
    setEngine(eng);
    setTimeout(() => eng.fitView(), 50);
    return () => eng.destroy();
  }, []);

  const apply = useCallback((algo: LayoutAlgorithm, dir?: string) => {
    if (!engine) return;
    const positions = engine.plugins.layout.computeLayout(algo, {
      direction: dir as 'TB' | 'LR', nodeSpacing: 220, rankSpacing: 160,
    });
    engine.plugins.layout.applyLayout(positions);
    engine.stateManager.forceUpdate();
    setTimeout(() => engine.fitView(40), 30);
    setCurrent(algo + (dir ? ` (${dir})` : ''));
  }, [engine]);

  const reset = useCallback(() => {
    if (!engine) return;
    engine.stateManager.setNodes(deepClone(INIT_NODES));
    engine.stateManager.setEdges(deepClone(INIT_EDGES));
    setTimeout(() => engine.fitView(40), 30);
    setCurrent('original');
  }, [engine]);

  return (
    <div style={WRAPPER}>
      <div style={BAR}>
        <button onClick={() => apply('dagre', 'TB')} style={S}>Dagre ↓</button>
        <button onClick={() => apply('dagre', 'LR')} style={S}>Dagre →</button>
        <button onClick={() => apply('force')} style={S}>Force</button>
        <button onClick={() => apply('grid')} style={S}>Grid</button>
        <button onClick={() => apply('radial')} style={S}>Radial</button>
        <button onClick={reset} style={{ ...S, background: 'var(--sci-surface-3)' }}>↺ Reset</button>
        <span style={{ color: 'var(--sci-text-muted)', fontSize: 13, marginLeft: 'auto' }}>Layout: {current}</span>
      </div>
      <div ref={ref} style={CANVAS} />
    </div>
  );
}

const WRAPPER: React.CSSProperties = { border: '1px solid var(--sci-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--sci-surface-1)', boxShadow: 'var(--sci-glass-shadow)' };
const BAR: React.CSSProperties = { display: 'flex', gap: 8, padding: '10px 14px', background: 'var(--sci-surface-2)', borderBottom: '1px solid var(--sci-border)', flexWrap: 'wrap', alignItems: 'center' };
const S: React.CSSProperties = { padding: '6px 14px', border: '1px solid var(--sci-border)', borderRadius: 6, cursor: 'pointer', background: 'var(--sci-surface-1)', color: 'var(--sci-text-primary)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const CANVAS: React.CSSProperties = { height: 400, background: 'var(--sci-surface-1)' };
