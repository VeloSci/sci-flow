import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type Node } from '@sci-flow/core';

const INIT_NODES: Node[] = [
  { id: 'n1', type: 'default', position: { x: 80, y: 100 }, data: { title: 'Processor' }, inputs: {}, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'n2', type: 'default', position: { x: 350, y: 100 }, data: { title: 'Analyzer' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'n3', type: 'default', position: { x: 200, y: 280 }, data: { title: 'Reporter' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: {} },
];
const INIT_EDGES = [
  { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'output', targetHandle: 'input' },
];

function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }

export function PerfDemo(_props: { theme?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [perfVisible, setPerfVisible] = useState(false);
  const [hc, setHc] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const eng = new SciFlow({ container: ref.current });
    eng.stateManager.setNodes(deepClone(INIT_NODES));
    eng.stateManager.setEdges(deepClone(INIT_EDGES));
    setEngine(eng);
    setTimeout(() => eng.fitView(), 50);
    return () => eng.destroy();
  }, []);

  const togglePerf = useCallback(() => {
    engine?.plugins.perfMonitor.toggle();
    setPerfVisible(engine?.plugins.perfMonitor.isVisible() ?? false);
  }, [engine]);
  const updateA11y = useCallback(() => {
    engine?.plugins.a11y.updateLabels();
    engine?.plugins.a11y.announce('Accessibility labels updated');
  }, [engine]);
  const toggleHC = useCallback(() => {
    engine?.plugins.a11y.toggleHighContrast();
    setHc(engine?.plugins.a11y.isHighContrast() ?? false);
  }, [engine]);
  const focusNext = useCallback(() => engine?.plugins.a11y.focusNode('next'), [engine]);

  return (
    <div style={WRAPPER}>
      <div style={BAR}>
        <button onClick={togglePerf} style={{ ...S, background: perfVisible ? 'var(--vp-c-brand)' : 'var(--sci-surface-1)', color: perfVisible ? '#fff' : 'var(--sci-text-primary)' }}>📊 FPS: {perfVisible ? 'ON' : 'OFF'}</button>
        <button onClick={updateA11y} style={S}>♿ Apply ARIA</button>
        <button onClick={toggleHC} style={{ ...S, background: hc ? 'var(--sci-accent-blue)' : 'var(--sci-surface-1)', color: hc ? '#fff' : 'var(--sci-text-primary)' }}>High Contrast: {hc ? 'ON' : 'OFF'}</button>
        <button onClick={focusNext} style={S}>Tab → Next Node</button>
      </div>
      <div ref={ref} style={CANVAS} />
    </div>
  );
}

const WRAPPER: React.CSSProperties = { border: '1px solid var(--sci-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--sci-surface-1)', boxShadow: 'var(--sci-glass-shadow)' };
const BAR: React.CSSProperties = { display: 'flex', gap: 8, padding: '10px 14px', background: 'var(--sci-surface-2)', borderBottom: '1px solid var(--sci-border)', flexWrap: 'wrap', alignItems: 'center' };
const S: React.CSSProperties = { padding: '6px 14px', border: '1px solid var(--sci-border)', borderRadius: 6, cursor: 'pointer', background: 'var(--sci-surface-1)', color: 'var(--sci-text-primary)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const CANVAS: React.CSSProperties = { height: 380, background: 'var(--sci-surface-1)' };
