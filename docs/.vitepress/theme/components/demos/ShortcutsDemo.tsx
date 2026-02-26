import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type Node } from '@sci-flow/core';
import type { ShortcutBinding } from '@sci-flow/core';

const INIT_NODES: Node[] = [
  { id: 'n1', type: 'default', position: { x: 80, y: 80 }, data: { title: 'Source' }, inputs: {}, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'n2', type: 'default', position: { x: 340, y: 80 }, data: { title: 'Transform' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: { output: { id: 'output', type: 'output', dataType: 'any' } } },
  { id: 'n3', type: 'default', position: { x: 200, y: 260 }, data: { title: 'Sink' }, inputs: { input: { id: 'input', type: 'input', dataType: 'any' } }, outputs: {} },
];
const INIT_EDGES = [
  { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'output', targetHandle: 'input' },
];

function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }

function mapToRecord(map: Map<string, ShortcutBinding>): Record<string, ShortcutBinding> {
  const obj: Record<string, ShortcutBinding> = {};
  map.forEach((v, k) => { obj[k] = v; });
  return obj;
}

export function ShortcutsDemo(_props: { theme?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [bindings, setBindings] = useState<Record<string, ShortcutBinding>>({});
  const [lastAction, setLastAction] = useState('Press a shortcut key...');

  useEffect(() => {
    if (!ref.current) return;
    const eng = new SciFlow({ container: ref.current });
    eng.stateManager.setNodes(deepClone(INIT_NODES));
    eng.stateManager.setEdges(deepClone(INIT_EDGES));

    eng.plugins.shortcuts.setShortcut('selectAll', { key: 'a', ctrl: true });
    eng.plugins.shortcuts.setShortcut('delete', { key: 'Delete' });
    eng.plugins.shortcuts.setShortcut('fitView', { key: 'f' });
    eng.plugins.shortcuts.onAction('fitView', () => {
      eng.fitView(40);
      setLastAction('🔲 fitView triggered (F)');
    });
    eng.plugins.shortcuts.onAction('selectAll', () => setLastAction('✅ selectAll (Ctrl+A)'));
    eng.plugins.shortcuts.onAction('delete', () => setLastAction('🗑 delete (Delete)'));

    setBindings(mapToRecord(eng.plugins.shortcuts.getAllBindings()));
    setEngine(eng);
    setTimeout(() => eng.fitView(), 50);
    return () => eng.destroy();
  }, []);

  const rebind = useCallback((action: string, key: string, ctrl = false) => {
    if (!engine) return;
    engine.plugins.shortcuts.setShortcut(action, { key, ctrl });
    setBindings(prev => ({ ...prev, [action]: { key, ctrl } }));
    setLastAction(`🔧 Rebound "${action}" → ${ctrl ? 'Ctrl+' : ''}${key}`);
  }, [engine]);

  return (
    <div style={WRAPPER}>
      <div style={BAR}>
        <span style={{ color: 'var(--vp-c-brand)', fontSize: 13, fontWeight: 600 }}>Shortcuts:</span>
        {Object.entries(bindings).map(([action, bind]) => (
          <span key={action} style={CHIP}>{action}: <span style={{ color: 'var(--vp-c-brand)', fontWeight: 'bold' }}>{bind.ctrl ? 'Ctrl+' : ''}{bind.key.toUpperCase()}</span></span>
        ))}
      </div>
      <div style={{ ...BAR, background: 'var(--sci-surface-3)', borderTop: 'none' }}>
        <button onClick={() => rebind('fitView', 'v')} style={S}>Rebind fitView → V</button>
        <button onClick={() => rebind('fitView', 'f')} style={S}>Rebind fitView → F</button>
        <button onClick={() => engine?.fitView(40)} style={{ ...S, background: 'var(--sci-accent-blue)', color: '#fff' }}>Fit View</button>
        <span style={{ color: 'var(--vp-c-brand-dark)', fontSize: 13, marginLeft: 'auto', fontWeight: 500 }}>{lastAction}</span>
      </div>
      <div ref={ref} style={CANVAS} tabIndex={0} />
    </div>
  );
}

const WRAPPER: React.CSSProperties = { border: '1px solid var(--sci-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--sci-surface-1)', boxShadow: 'var(--sci-glass-shadow)', outline: 'none' };
const BAR: React.CSSProperties = { display: 'flex', gap: 8, padding: '10px 14px', background: 'var(--sci-surface-2)', borderBottom: '1px solid var(--sci-border)', flexWrap: 'wrap', alignItems: 'center' };
const S: React.CSSProperties = { padding: '6px 14px', border: '1px solid var(--sci-border)', borderRadius: 6, cursor: 'pointer', background: 'var(--sci-surface-1)', color: 'var(--sci-text-primary)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const CHIP: React.CSSProperties = { padding: '4px 8px', borderRadius: 4, background: 'var(--sci-surface-1)', border: '1px solid var(--sci-border)', color: 'var(--sci-text-primary)', fontSize: 12, fontFamily: 'monospace' };
const CANVAS: React.CSSProperties = { height: 360, background: 'var(--sci-surface-1)', outline: 'none' };
