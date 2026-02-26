import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type Node } from '@sci-flow/core';

const NODES: Node[] = [
  { id: 'n1', type: 'default', position: { x: 80, y: 100 }, data: { title: 'Processor' }, inputs: {}, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'n2', type: 'default', position: { x: 350, y: 100 }, data: { title: 'Analyzer' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'n3', type: 'default', position: { x: 200, y: 280 }, data: { title: 'Reporter' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: {} },
];
const EDGES = [
  { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'output', targetHandle: 'input' },
];

export function PerfDemo(_props: { theme?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [perfVisible, setPerfVisible] = useState(false);
  const [hc, setHc] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const eng = new SciFlow({ container: containerRef.current });
    eng.stateManager.setNodes(NODES.map(n => ({ ...n })));
    eng.stateManager.setEdges(EDGES.map(ed => ({ ...ed })));
    setEngine(eng);
    return () => eng.destroy();
  }, []);

  const togglePerf = useCallback(() => { engine?.plugins.perfMonitor.toggle(); setPerfVisible(engine?.plugins.perfMonitor.isVisible() ?? false); }, [engine]);
  const updateA11y = useCallback(() => { engine?.plugins.a11y.updateLabels(); engine?.plugins.a11y.announce('Accessibility labels updated'); }, [engine]);
  const toggleHC = useCallback(() => { engine?.plugins.a11y.toggleHighContrast(); setHc(engine?.plugins.a11y.isHighContrast() ?? false); }, [engine]);
  const focusNext = useCallback(() => engine?.plugins.a11y.focusNode('next'), [engine]);

  return (
    <div style={{ border: '1px solid #333', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', background: '#1e1e2e', flexWrap: 'wrap' }}>
        <button onClick={togglePerf} style={{ ...S, background: perfVisible ? '#00b894' : '#333' }}>📊 FPS: {perfVisible ? 'ON' : 'OFF'}</button>
        <button onClick={updateA11y} style={S}>♿ Apply ARIA</button>
        <button onClick={toggleHC} style={{ ...S, background: hc ? '#fdcb6e' : '#333', color: hc ? '#000' : '#fff' }}>High Contrast: {hc ? 'ON' : 'OFF'}</button>
        <button onClick={focusNext} style={S}>Tab → Next Node</button>
      </div>
      <div ref={containerRef} style={{ height: 380, background: '#0d0d1a' }} />
    </div>
  );
}

const S: React.CSSProperties = { padding: '4px 12px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#333', color: '#fff', fontSize: 12, fontFamily: 'monospace' };
