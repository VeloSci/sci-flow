import React, { useState } from 'react';
import type { SciFlow } from '@sci-flow/core';

interface Props {
  engine: SciFlow | null;
}

/**
 * Compact feature panel for the docs playground — export, animation, collision, LOD, eval.
 */
export function FeaturePanelDoc({ engine }: Props) {
  const [collisionMode, setCollisionMode] = useState<string>('push');
  const [evalResult, setEvalResult] = useState('');

  const handleExport = async (fmt: 'png' | 'svg' | 'json') => {
    if (!engine) return;
    await engine.plugins.exporter.download('sci-flow', fmt);
  };

  const handleAnimateLayout = async () => {
    if (!engine) return;
    const state = engine.getState();
    const targets = new Map<string, { x: number; y: number }>();
    let i = 0;
    state.nodes.forEach((node) => {
      targets.set(node.id, { x: 80 + (i % 3) * 250, y: 80 + Math.floor(i / 3) * 180 });
      i++;
    });
    await engine.plugins.animation.animateNodePositions(targets, 500);
  };

  const handleCollision = (mode: string) => {
    setCollisionMode(mode);
    if (engine) engine.plugins.collision.mode = mode as 'none' | 'push' | 'block';
  };

  const handleEvaluate = () => {
    if (!engine) return;
    const result = engine.plugins.evaluation.evaluate();
    const obj: Record<string, unknown> = {};
    result.forEach((v, k) => { obj[k] = v; });
    setEvalResult(JSON.stringify(obj, null, 2));
  };

  return (
    <div style={panelStyle}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>🔬 Features</div>

      <Row title="Export">
        {(['png', 'svg', 'json'] as const).map(f => (
          <Btn key={f} label={f.toUpperCase()} onClick={() => handleExport(f)} />
        ))}
      </Row>

      <Row title="Animate">
        <Btn label="Auto-Layout" onClick={handleAnimateLayout} full />
      </Row>

      <Row title="Collision">
        {(['none', 'push', 'block'] as const).map(m => (
          <Btn key={m} label={m} onClick={() => handleCollision(m)} active={collisionMode === m} />
        ))}
      </Row>

      <Row title="LOD">
        <Btn label="Check Level" onClick={() => alert(`LOD: ${engine?.plugins.lod.getLevel()}`)} full />
      </Row>

      <Row title="Evaluate">
        <Btn label="Run Pipeline" onClick={handleEvaluate} full />
      </Row>

      {evalResult && (
        <pre style={{ fontSize: 8, maxHeight: 60, overflow: 'auto', margin: '2px 0 0',
          background: '#111', padding: 4, borderRadius: 3, color: '#4ecdc4' }}>{evalResult}</pre>
      )}
    </div>
  );
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 10, color: '#888', marginBottom: 2 }}>{title}</div>
      <div style={{ display: 'flex', gap: 3 }}>{children}</div>
    </div>
  );
}

function Btn({ label, onClick, full, active }: {
  label: string; onClick: () => void; full?: boolean; active?: boolean;
}) {
  return (
    <button onClick={onClick} style={{
      flex: full ? 1 : undefined, padding: '3px 6px', fontSize: 10,
      background: active ? '#4ecdc4' : 'rgba(255,255,255,0.08)', color: active ? '#000' : '#fff',
      border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3, cursor: 'pointer',
      ...(full ? { width: '100%' } : {})
    }}>{label}</button>
  );
}

const panelStyle: React.CSSProperties = {
  position: 'absolute', right: 8, top: 8, zIndex: 50,
  background: 'rgba(0,0,0,0.8)', padding: 10, borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
  width: 180, backdropFilter: 'blur(10px)', fontFamily: 'Inter, sans-serif',
};
