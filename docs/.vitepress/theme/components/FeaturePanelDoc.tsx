import React, { useState } from 'react';
import type { SciFlow } from '@sci-flow/core';
import { LayoutDashboard, Layers, Activity, FlaskConical } from 'lucide-react';

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
    <div className="absolute right-2 top-2 z-[50] bg-black/80 p-2.5 rounded-md border border-white/10 text-white w-[180px] backdrop-blur-md font-sans">
      <div className="text-xs font-semibold mb-1.5 flex items-center gap-1.5"><FlaskConical size={14} className="text-emerald-400" /> Features</div>

      <Row title="Export">
        {(['png', 'svg', 'json'] as const).map(f => (
          <Btn key={f} label={f.toUpperCase()} onClick={() => handleExport(f)} />
        ))}
      </Row>

      <Row title="Animate">
        <Btn label={<><LayoutDashboard size={12}/> Auto-Layout</>} onClick={handleAnimateLayout} full />
      </Row>

      <Row title="Collision">
        {(['none', 'push', 'block'] as const).map(m => (
          <Btn key={m} label={m} onClick={() => handleCollision(m)} active={collisionMode === m} />
        ))}
      </Row>

      <Row title="LOD">
        <Btn label={<><Layers size={12}/> Check Level</>} onClick={() => alert(`LOD: ${engine?.plugins.lod.getLevel()}`)} full />
      </Row>

      <Row title="Evaluate">
        <Btn label={<><Activity size={12}/> Run Pipeline</>} onClick={handleEvaluate} full />
      </Row>

      {evalResult && (
        <pre className="text-[8px] max-h-[60px] overflow-auto mt-0.5 bg-[#111] p-1 rounded-sm text-emerald-400 font-mono">
          {evalResult}
        </pre>
      )}
    </div>
  );
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1.5">
      <div className="text-[10px] text-gray-400 mb-0.5">{title}</div>
      <div className="flex gap-1">{children}</div>
    </div>
  );
}

function Btn({ label, onClick, full, active }: {
  label: React.ReactNode; onClick: () => void; full?: boolean; active?: boolean;
}) {
  return (
    <button onClick={onClick} className={`flex items-center justify-center gap-1 px-1.5 py-1 text-[10px] rounded-[3px] border cursor-pointer transition-colors ${
      active 
        ? 'bg-emerald-400 text-black border-transparent font-medium' 
        : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
    } ${full ? 'flex-1 w-full' : ''}`}>
      {label}
    </button>
  );
}
