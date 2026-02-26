import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type Node, type Edge } from '@sci-flow/core';

const INIT_NODES: Node[] = [
  { id: 'start', type: 'default', position: { x: 200, y: 150 }, data: { title: 'Start Here' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
];
const INIT_EDGES: Edge[] = [];

function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }

const PALETTE = [
  { type: 'processor', title: '🔧 Filter', color: '#4ecdc4' },
  { type: 'transformer', title: '⚡ Transform', color: '#6c5ce7' },
  { type: 'output', title: '📤 Output', color: '#e17055' },
];

export function DragDropDemo(_props: { theme?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (!ref.current) return;
    const eng = new SciFlow({ container: ref.current });
    eng.stateManager.setNodes(deepClone(INIT_NODES));
    eng.stateManager.setEdges(deepClone(INIT_EDGES));
    setEngine(eng);
    setTimeout(() => eng.fitView(), 50);
    return () => eng.destroy();
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, item: typeof PALETTE[0]) => {
    e.dataTransfer.setData('application/sci-flow-node', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!engine || !ref.current) return;
    const data = e.dataTransfer.getData('application/sci-flow-node');
    if (!data) return;
    const item = JSON.parse(data);
    const rect = ref.current.getBoundingClientRect();
    const state = engine.getState();
    const x = (e.clientX - rect.left - state.viewport.x) / state.viewport.zoom;
    const y = (e.clientY - rect.top - state.viewport.y) / state.viewport.zoom;
    const id = `dropped-${Date.now()}`;
    engine.addNode({
      id, type: 'default', position: { x, y },
      data: { title: item.title },
      inputs: { input: { id: 'input', type: 'input', dataType: 'any' } },
      outputs: { output: { id: 'output', type: 'output', dataType: 'any' } },
    });
    setCount(c => c + 1);
  }, [engine]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);

  const reset = useCallback(() => {
    if (!engine) return;
    engine.stateManager.setNodes(deepClone(INIT_NODES));
    engine.stateManager.setEdges(deepClone(INIT_EDGES));
    setCount(1);
    setTimeout(() => engine.fitView(40), 30);
  }, [engine]);

  return (
    <div style={WRAPPER}>
      <div style={BAR}>
        <span style={{ color: 'var(--sci-text-muted)', fontSize: 13 }}>Drag → Canvas:</span>
        {PALETTE.map(item => (
          <div key={item.type} draggable onDragStart={e => handleDragStart(e, item)}
            style={{ ...S, background: item.color, color: '#fff', cursor: 'grab', border: 'none' }}>
            {item.title}
          </div>
        ))}
        <button onClick={reset} style={{ ...S, background: 'var(--sci-surface-3)', marginLeft: 'auto' }}>↺ Reset</button>
        <span style={{ color: 'var(--vp-c-brand)', fontSize: 13, fontWeight: 500 }}>Nodes: {count}</span>
      </div>
      <div ref={ref} onDrop={handleDrop} onDragOver={handleDragOver} style={CANVAS} />
    </div>
  );
}

const WRAPPER: React.CSSProperties = { border: '1px solid var(--sci-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--sci-surface-1)', boxShadow: 'var(--sci-glass-shadow)' };
const BAR: React.CSSProperties = { display: 'flex', gap: 8, padding: '10px 14px', background: 'var(--sci-surface-2)', borderBottom: '1px solid var(--sci-border)', flexWrap: 'wrap', alignItems: 'center' };
const S: React.CSSProperties = { padding: '6px 14px', border: '1px solid var(--sci-border)', borderRadius: 6, cursor: 'pointer', background: 'var(--sci-surface-1)', color: 'var(--sci-text-primary)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const CANVAS: React.CSSProperties = { height: 380, background: 'var(--sci-surface-1)' };
