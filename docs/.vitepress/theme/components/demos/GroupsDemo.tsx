import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type Node } from '@sci-flow/core';

const INIT_NODES: Node[] = [
  { id: 'n1', type: 'default', position: { x: 60, y: 80 }, data: { title: 'Input' }, inputs: {}, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'n2', type: 'default', position: { x: 300, y: 30 }, data: { title: 'Process' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'n3', type: 'default', position: { x: 300, y: 200 }, data: { title: 'Validate' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'n4', type: 'default', position: { x: 540, y: 120 }, data: { title: 'Output' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: {} },
];
const INIT_EDGES = [
  { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e2', source: 'n1', target: 'n3', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e3', source: 'n2', target: 'n4', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e4', source: 'n3', target: 'n4', sourceHandle: 'output', targetHandle: 'input' },
];

function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }

export function GroupsDemo(_props: { theme?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [msg, setMsg] = useState('Click "Group Pipeline" to group n1+n2+n3');

  useEffect(() => {
    if (!ref.current) return;
    const eng = new SciFlow({ container: ref.current });
    eng.stateManager.setNodes(deepClone(INIT_NODES));
    eng.stateManager.setEdges(deepClone(INIT_EDGES));
    setEngine(eng);
    setTimeout(() => eng.fitView(), 50);
    return () => eng.destroy();
  }, []);

  const addGroup = useCallback((label: string, ids: string[], color: string) => {
    if (!engine) return;
    const g = engine.plugins.groups.createGroup(label, ids, color);
    if (g) {
      setGroups(engine.plugins.groups.getAllGroups().map(gr => gr.id));
      setMsg(`✅ Created "${label}" — select Collapse or Move`);
      engine.fitView(40);
    }
  }, [engine]);

  const toggleCollapse = useCallback((gid: string) => {
    engine?.plugins.groups.toggleCollapse(gid);
    engine?.stateManager.forceUpdate();
    setMsg('⊟ Toggled collapse');
  }, [engine]);

  const moveRight = useCallback((gid: string) => {
    engine?.plugins.groups.moveGroup(gid, 80, 0);
    engine?.stateManager.forceUpdate();
    engine?.fitView(40);
    setMsg('→ Moved group right +80px');
  }, [engine]);

  return (
    <div style={WRAPPER}>
      <div style={BAR}>
        <button onClick={() => addGroup('Pipeline', ['n1', 'n2', 'n3'], 'var(--vp-c-brand)')} style={{ ...S, background: 'var(--vp-c-brand)', color: '#fff' }}>Group Pipeline</button>
        <button onClick={() => addGroup('Output', ['n4'], 'var(--sci-accent-blue)')} style={{ ...S, background: 'var(--sci-accent-blue)', color: '#fff' }}>Group Output</button>
        {groups.map((gid, i) => (
          <React.Fragment key={gid}>
            <button onClick={() => toggleCollapse(gid)} style={S}>⊟ Collapse {i + 1}</button>
            <button onClick={() => moveRight(gid)} style={S}>→ Move {i + 1}</button>
          </React.Fragment>
        ))}
      </div>
      {msg && <div style={{ padding: '8px 14px', background: 'var(--sci-surface-3)', color: 'var(--sci-text-secondary)', fontSize: 13, borderBottom: '1px solid var(--sci-border)' }}>{msg}</div>}
      <div ref={ref} style={CANVAS} />
    </div>
  );
}

const WRAPPER: React.CSSProperties = { border: '1px solid var(--sci-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--sci-surface-1)', boxShadow: 'var(--sci-glass-shadow)' };
const BAR: React.CSSProperties = { display: 'flex', gap: 8, padding: '10px 14px', background: 'var(--sci-surface-2)', borderBottom: '1px solid var(--sci-border)', flexWrap: 'wrap', alignItems: 'center' };
const S: React.CSSProperties = { padding: '6px 14px', border: '1px solid var(--sci-border)', borderRadius: 6, cursor: 'pointer', background: 'var(--sci-surface-1)', color: 'var(--sci-text-primary)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const CANVAS: React.CSSProperties = { height: 380, background: 'var(--sci-surface-1)' };
