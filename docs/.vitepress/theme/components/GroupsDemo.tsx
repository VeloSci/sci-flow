import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type Node } from '@sci-flow/core';

const NODES: Node[] = [
  { id: 'n1', type: 'default', position: { x: 60, y: 80 }, data: { title: 'Input' }, inputs: {}, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'n2', type: 'default', position: { x: 300, y: 30 }, data: { title: 'Process' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'n3', type: 'default', position: { x: 300, y: 200 }, data: { title: 'Validate' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'n4', type: 'default', position: { x: 540, y: 120 }, data: { title: 'Output' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: {} },
];
const EDGES = [
  { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e2', source: 'n1', target: 'n3', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e3', source: 'n2', target: 'n4', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e4', source: 'n3', target: 'n4', sourceHandle: 'output', targetHandle: 'input' },
];

export function GroupsDemo(_props: { theme?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!containerRef.current) return;
    const eng = new SciFlow({ container: containerRef.current });
    eng.stateManager.setNodes(NODES.map(n => ({ ...n })));
    eng.stateManager.setEdges(EDGES.map(ed => ({ ...ed })));
    setEngine(eng);
    return () => eng.destroy();
  }, []);

  const addGroup = useCallback((label: string, ids: string[], color: string) => {
    if (!engine) return;
    const g = engine.plugins.groups.createGroup(label, ids, color);
    if (g) { setGroups(engine.plugins.groups.getAllGroups().map(gr => gr.id)); setMsg(`✅ Created "${label}"`); }
  }, [engine]);
  const toggleCollapse = useCallback((gid: string) => { engine?.plugins.groups.toggleCollapse(gid); setMsg('Toggled collapse'); }, [engine]);
  const moveRight = useCallback((gid: string) => { engine?.plugins.groups.moveGroup(gid, 50, 0); engine?.stateManager.forceUpdate(); setMsg('→ Moved right'); }, [engine]);

  return (
    <div style={{ border: '1px solid #333', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 6, padding: '8px 12px', background: '#1e1e2e', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => addGroup('Pipeline', ['n1', 'n2', 'n3'], '#4ecdc4')} style={{ ...S, background: '#4ecdc4', color: '#000' }}>Group Pipeline</button>
        <button onClick={() => addGroup('Output', ['n4'], '#e17055')} style={{ ...S, background: '#e17055' }}>Group Output</button>
        {groups.map(gid => (
          <React.Fragment key={gid}>
            <button onClick={() => toggleCollapse(gid)} style={S}>⊟ Collapse</button>
            <button onClick={() => moveRight(gid)} style={S}>→ Move</button>
          </React.Fragment>
        ))}
        {msg && <span style={{ color: '#4ecdc4', fontSize: 11, marginLeft: 'auto' }}>{msg}</span>}
      </div>
      <div ref={containerRef} style={{ height: 380, background: '#0d0d1a' }} />
    </div>
  );
}

const S: React.CSSProperties = { padding: '4px 10px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#333', color: '#fff', fontSize: 11, fontFamily: 'monospace' };
