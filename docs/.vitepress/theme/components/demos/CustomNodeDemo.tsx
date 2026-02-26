import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type Node } from '@sci-flow/core';

const INIT_NODES: Node[] = [
  { id: 'math', type: 'default', position: { x: 60, y: 60 }, data: { title: '➕ Math Add', operation: 'add' }, inputs: { a: { id: 'a', type: 'input', dataType: 'number' }, b: { id: 'b', type: 'input', dataType: 'number' } }, outputs: { result: { id: 'result', type: 'output', dataType: 'number' } }, shape: 'rectangle' },
  { id: 'concat', type: 'default', position: { x: 320, y: 60 }, data: { title: '🔗 String Concat', separator: ', ' }, inputs: { left: { id: 'left', type: 'input', dataType: 'string' }, right: { id: 'right', type: 'input', dataType: 'string' } }, outputs: { out: { id: 'out', type: 'output', dataType: 'string' } }, shape: 'rectangle' },
  { id: 'display', type: 'default', position: { x: 190, y: 260 }, data: { title: '📊 Display', format: 'table' }, inputs: { data: { id: 'data', type: 'input', dataType: 'any' } }, outputs: {}, shape: 'rectangle' },
];
const INIT_EDGES = [
  { id: 'e1', source: 'math', target: 'display', sourceHandle: 'result', targetHandle: 'data' },
  { id: 'e2', source: 'concat', target: 'display', sourceHandle: 'out', targetHandle: 'data' },
];

function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }

const SHAPES: Array<Node['shape']> = ['rectangle', 'circle', 'diamond', 'hexagon', 'ellipse'];

export function CustomNodeDemo(_props: { theme?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [msg, setMsg] = useState('Nodes with custom shapes, typed ports, and rich data');

  useEffect(() => {
    if (!ref.current) return;
    const eng = new SciFlow({ container: ref.current });
    eng.stateManager.setNodes(deepClone(INIT_NODES));
    eng.stateManager.setEdges(deepClone(INIT_EDGES));
    setEngine(eng);
    setTimeout(() => eng.fitView(), 50);
    return () => eng.destroy();
  }, []);

  const changeShape = useCallback((nodeId: string, shape: Node['shape']) => {
    if (!engine) return;
    const state = engine.getState();
    const node = state.nodes.get(nodeId);
    if (node) { node.shape = shape; engine.stateManager.forceUpdate(); }
    setMsg(`Changed ${nodeId} shape → ${shape}`);
  }, [engine]);

  const toggleResize = useCallback((nodeId: string) => {
    if (!engine) return;
    const state = engine.getState();
    const node = state.nodes.get(nodeId);
    if (node) { node.resizable = !node.resizable; engine.stateManager.forceUpdate(); }
    setMsg(`Toggled resize on ${nodeId}`);
  }, [engine]);

  const addCustom = useCallback(() => {
    if (!engine) return;
    const id = `custom-${Date.now()}`;
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    engine.addNode({
      id, type: 'default', position: { x: 100 + Math.random() * 300, y: 50 + Math.random() * 250 },
      data: { title: `🎨 ${shape}` },
      inputs: { input: { id: 'input', type: 'input', dataType: 'any' } },
      outputs: { output: { id: 'output', type: 'output', dataType: 'any' } },
      shape,
    });
    setMsg(`Added ${shape} node`);
  }, [engine]);

  return (
    <div style={WRAPPER}>
      <div style={BAR}>
        <button onClick={addCustom} style={{ ...S, background: 'var(--vp-c-brand)', color: '#fff' }}>+ Add Random Shape</button>
        {SHAPES.map(s => (
          <button key={s} onClick={() => changeShape('math', s)} style={S}>{s}</button>
        ))}
        <button onClick={() => toggleResize('math')} style={{ ...S, background: 'var(--sci-accent-blue)', color: '#fff' }}>Toggle Resize</button>
      </div>
      <div style={{ padding: '8px 14px', background: 'var(--sci-surface-3)', borderBottom: '1px solid var(--sci-border)', color: 'var(--sci-text-secondary)', fontSize: 13 }}>{msg}</div>
      <div ref={ref} style={CANVAS} />
    </div>
  );
}

const WRAPPER: React.CSSProperties = { border: '1px solid var(--sci-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--sci-surface-1)', boxShadow: 'var(--sci-glass-shadow)' };
const BAR: React.CSSProperties = { display: 'flex', gap: 8, padding: '10px 14px', background: 'var(--sci-surface-2)', borderBottom: '1px solid var(--sci-border)', flexWrap: 'wrap', alignItems: 'center' };
const S: React.CSSProperties = { padding: '6px 14px', border: '1px solid var(--sci-border)', borderRadius: 6, cursor: 'pointer', background: 'var(--sci-surface-1)', color: 'var(--sci-text-primary)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const CANVAS: React.CSSProperties = { height: 380, background: 'var(--sci-surface-1)' };
