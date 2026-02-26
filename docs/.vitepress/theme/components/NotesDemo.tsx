import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SciFlow, type StickyNote, type Node } from '@sci-flow/core';

const NODES: Node[] = [
  { id: 'a', type: 'default', position: { x: 80, y: 60 }, data: { title: 'API' }, inputs: {}, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'b', type: 'default', position: { x: 350, y: 60 }, data: { title: 'Cache' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'c', type: 'default', position: { x: 80, y: 240 }, data: { title: 'DB' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: { output: { id: 'output', type: 'output' as const, dataType: 'any' as const } } },
  { id: 'd', type: 'default', position: { x: 350, y: 240 }, data: { title: 'Logger' }, inputs: { input: { id: 'input', type: 'input' as const, dataType: 'any' as const } }, outputs: {} },
];
const EDGES = [
  { id: 'e1', source: 'a', target: 'b', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e2', source: 'a', target: 'c', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e3', source: 'b', target: 'd', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e4', source: 'c', target: 'd', sourceHandle: 'output', targetHandle: 'input' },
];
const COLORS = ['#ffd93d', '#ff6b6b', '#95e1d3', '#a29bfe', '#fd79a8'];

export function NotesDemo(_props: { theme?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [bundles, setBundles] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const eng = new SciFlow({ container: containerRef.current });
    eng.stateManager.setNodes(NODES.map(n => ({ ...n })));
    eng.stateManager.setEdges(EDGES.map(ed => ({ ...ed })));
    setEngine(eng);
    return () => eng.destroy();
  }, []);

  const addNote = useCallback(() => {
    if (!engine) return;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    engine.plugins.stickyNotes.add(`Note #${notes.length + 1}`, 100 + Math.random() * 300, 50 + Math.random() * 200, color);
    setNotes(engine.plugins.stickyNotes.getAll());
  }, [engine, notes]);
  const clearNotes = useCallback(() => { engine?.plugins.stickyNotes.clear(); setNotes([]); }, [engine]);
  const detectBundles = useCallback(() => { engine?.plugins.edgeBundler.detectBundles(); setBundles(engine?.plugins.edgeBundler.getBundles().length ?? 0); }, [engine]);

  return (
    <div style={{ border: '1px solid #333', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', background: '#1e1e2e', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={addNote} style={{ ...S, background: '#ffd93d', color: '#000' }}>📝 Add Note</button>
        <button onClick={clearNotes} style={S}>🗑 Clear Notes</button>
        <button onClick={detectBundles} style={{ ...S, background: '#6c5ce7' }}>🔗 Detect Bundles</button>
        <span style={{ color: '#888', fontSize: 11, marginLeft: 'auto' }}>Notes: {notes.length} | Bundles: {bundles}</span>
      </div>
      <div ref={containerRef} style={{ height: 380, background: '#0d0d1a' }} />
    </div>
  );
}

const S: React.CSSProperties = { padding: '4px 12px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#333', color: '#fff', fontSize: 12, fontFamily: 'monospace' };
