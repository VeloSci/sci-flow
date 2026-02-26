import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type Node } from '@sci-flow/core';

const INIT_NODES: Node[] = [
  { id: 'n1', type: 'default', position: { x: 50, y: 50 }, data: { title: 'Reader' }, inputs: {}, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'n2', type: 'default', position: { x: 280, y: 50 }, data: { title: 'Parser' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'n3', type: 'default', position: { x: 160, y: 230 }, data: { title: 'Writer' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: {} },
];
const INIT_EDGES = [
  { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'output', targetHandle: 'input' },
];

function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }

export function ExportDemo(_props: { theme?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [msg, setMsg] = useState('Click buttons to export or animate');

  useEffect(() => {
    if (!ref.current) return;
    const eng = new SciFlow({ container: ref.current });
    eng.stateManager.setNodes(deepClone(INIT_NODES));
    eng.stateManager.setEdges(deepClone(INIT_EDGES));
    setEngine(eng);
    setTimeout(() => eng.fitView(), 50);
    return () => eng.destroy();
  }, []);

  const exportPNG = useCallback(async () => {
    if (!engine) return;
    try {
      await engine.plugins.exporter.download('flow-demo', 'png');
      setMsg('📥 PNG downloaded!');
    } catch { setMsg('⚠ PNG export not available'); }
  }, [engine]);

  const exportSVG = useCallback(async () => {
    if (!engine) return;
    try {
      await engine.plugins.exporter.download('flow-demo', 'svg');
      setMsg('📥 SVG downloaded!');
    } catch { setMsg('⚠ SVG export not available'); }
  }, [engine]);

  const exportJSON = useCallback(() => {
    if (!engine) return;
    const json = engine.toJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'flow-demo.json'; a.click();
    URL.revokeObjectURL(url);
    setMsg('📥 JSON downloaded!');
  }, [engine]);

  const animateToGrid = useCallback(async () => {
    if (!engine) return;
    const state = engine.getState();
    const targets = new Map<string, { x: number; y: number }>();
    let i = 0;
    state.nodes.forEach((node) => {
      targets.set(node.id, { x: 80 + (i % 3) * 230, y: 60 + Math.floor(i / 3) * 200 });
      i++;
    });
    try {
      await engine.plugins.animation.animateNodePositions(targets, 600);
      engine.fitView(40);
      setMsg('✨ Animated to grid!');
    } catch {
      // Fallback: apply positions directly
      targets.forEach((pos, id) => engine.updateNodePosition(id, pos.x, pos.y));
      engine.fitView(40);
      setMsg('✨ Applied grid positions');
    }
  }, [engine]);

  const resetPositions = useCallback(() => {
    if (!engine) return;
    engine.stateManager.setNodes(deepClone(INIT_NODES));
    engine.stateManager.setEdges(deepClone(INIT_EDGES));
    setTimeout(() => engine.fitView(40), 30);
    setMsg('↺ Reset to original');
  }, [engine]);

  return (
    <div style={WRAPPER}>
      <div style={BAR}>
        <button onClick={exportPNG} style={{ ...S, background: 'var(--sci-accent-blue)', color: '#fff' }}>📸 PNG</button>
        <button onClick={exportSVG} style={{ ...S, background: 'var(--vp-c-brand)', color: '#fff' }}>🖼 SVG</button>
        <button onClick={exportJSON} style={{ ...S, background: 'var(--sci-surface-3)' }}>📋 JSON</button>
        <span style={{ color: 'var(--sci-border)', margin: '0 8px' }}>|</span>
        <button onClick={animateToGrid} style={{ ...S, background: 'var(--sci-accent-blue)', color: '#fff' }}>✨ Animate Grid</button>
        <button onClick={resetPositions} style={S}>↺ Reset</button>
        <span style={{ color: 'var(--sci-text-muted)', fontSize: 13, marginLeft: 'auto', fontWeight: 500 }}>{msg}</span>
      </div>
      <div ref={ref} style={CANVAS} />
    </div>
  );
}

const WRAPPER: React.CSSProperties = { border: '1px solid var(--sci-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--sci-surface-1)', boxShadow: 'var(--sci-glass-shadow)' };
const BAR: React.CSSProperties = { display: 'flex', gap: 8, padding: '10px 14px', background: 'var(--sci-surface-2)', borderBottom: '1px solid var(--sci-border)', flexWrap: 'wrap', alignItems: 'center' };
const S: React.CSSProperties = { padding: '6px 14px', border: '1px solid var(--sci-border)', borderRadius: 6, cursor: 'pointer', background: 'var(--sci-surface-1)', color: 'var(--sci-text-primary)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const CANVAS: React.CSSProperties = { height: 380, background: 'var(--sci-surface-1)' };
