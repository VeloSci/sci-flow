import React, { useState } from 'react';
import type { SciFlow, Edge } from '@sci-flow/core';

/** Extracted toolbar for the FullExampleApp — routing, animation, line style, file ops. */
export function ExampleToolbar({ engine, themeMode, setThemeMode, direction, toggleDirection }: {
  engine: SciFlow | null;
  themeMode: 'light' | 'dark';
  setThemeMode: (t: 'light' | 'dark') => void;
  direction: 'horizontal' | 'vertical';
  toggleDirection: () => void;
}) {
  const [animType, setAnimType] = useState('dash');
  const [beamColor, setBeamColor] = useState('#00f2ff');
  const [routingMode, setRoutingMode] = useState('smart');
  const [lineStyle, setLineStyle] = useState('solid');

  const applyEdgeAnimation = (type: string) => {
    if (!engine) return;
    setAnimType(type);
    const state = engine.getState();
    if (type === 'none') {
      state.edges.forEach(edge => { edge.animated = false; edge.style = { ...edge.style, animationType: undefined }; });
    } else {
      const styleUpdate: Record<string, unknown> = { animationType: type };
      if (type === 'beam') styleUpdate.animationColor = beamColor;
      engine.setDefaultEdgeStyle(styleUpdate as Partial<Edge['style']>);
      state.edges.forEach(edge => { edge.animated = true; edge.style = { ...edge.style, ...styleUpdate } as Edge['style']; });
    }
    engine.forceUpdate();
  };

  const applyRoutingMode = (mode: string) => {
    setRoutingMode(mode);
    if (!engine) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine.setDefaultEdgeType(mode as any);
    const state = engine.getState();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state.edges.forEach((edge: any) => { edge.type = mode; });
    engine.forceUpdate();
  };

  const applyLineStyle = (style: string) => {
    setLineStyle(style);
    if (!engine) return;
    const ls = style === 'none' ? 'solid' : style;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine.setDefaultEdgeStyle({ lineStyle: ls as any });
    const state = engine.getState();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state.edges.forEach(edge => { edge.style = { ...edge.style, lineStyle: ls as any }; });
    engine.forceUpdate();
  };

  const handleAddNode = () => {
    if (!engine) return;
    const state = engine.getState();
    const cx = -state.viewport.x + 400;
    const cy = -state.viewport.y + 300;
    const protos = [
      { type: 'generator', in: 0, out: 1, title: 'Waveform', outLabels: ['Out'], outTypes: ['number'] },
      { type: 'processor', in: 1, out: 2, title: 'Filter', inLabels: ['In'], outLabels: ['Sub', 'LFO'], inTypes: ['number'], outTypes: ['number', 'object'] },
      { type: 'viewer', in: 1, out: 0, title: 'Monitor', inLabels: ['Data'], inTypes: ['any'] },
    ];
    const proto = protos[Math.floor(Math.random() * protos.length)];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inputs: Record<string, any> = {};
    for (let i = 0; i < proto.in; i++) {
      inputs[`in${i+1}`] = { id: `in${i+1}`, label: proto.inLabels?.[i] || `in${i+1}`, type: 'input', dataType: proto.inTypes?.[i] || 'any' };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const outputs: Record<string, any> = {};
    for (let i = 0; i < proto.out; i++) {
      outputs[`out${i+1}`] = { id: `out${i+1}`, label: proto.outLabels?.[i] || `out${i+1}`, type: 'output', dataType: proto.outTypes?.[i] || 'any' };
    }
    engine.addNode({
      id: `node-${Date.now()}`, type: proto.type,
      position: { x: cx / state.viewport.zoom, y: cy / state.viewport.zoom },
      data: { title: proto.title }, inputs, outputs,
      style: { width: 160, height: 100 + Math.max(proto.in, proto.out) * 20 }
    });
  };

  const handleDownload = () => {
    if (!engine) return;
    const json = engine.toJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = 'sciflow-state.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && engine) {
      const reader = new FileReader();
      reader.onload = (ev) => engine.fromJSON(ev.target?.result as string);
      reader.readAsText(file);
    }
  };

  const animTypes = ['none', 'dash', 'dotted', 'pulse', 'arrows', 'symbols', 'beam'];
  const lineStyles = ['none', 'solid', 'dashed', 'dotted'];

  return (
    <div style={{ position: 'relative', zIndex: 100, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
      <button onClick={handleAddNode} style={accBtnStyle}>+ Add Node</button>
      <button onClick={() => engine?.fitView()} style={btnStyle}>⊡ Fit</button>
      <button onClick={toggleDirection} style={btnStyle}>
        {direction === 'horizontal' ? '⬇ Vert' : '➡ Horiz'}
      </button>
      <div style={dividerStyle} />

      <select value={routingMode} onChange={e => applyRoutingMode(e.target.value)} style={selStyle}>
        <option value="bezier">Bezier</option>
        <option value="straight">Straight</option>
        <option value="step">Step</option>
        <option value="smart">Smart(A★)</option>
      </select>

      <select value={lineStyle} onChange={e => applyLineStyle(e.target.value)} style={selStyle}>
        {lineStyles.map(s => <option key={s} value={s}>{s === 'none' ? 'Line:—' : s}</option>)}
      </select>
      <div style={dividerStyle} />

      <span style={{ fontSize: 10, color: '#aaa' }}>Anim:</span>
      <select value={animType} onChange={e => applyEdgeAnimation(e.target.value)} style={selStyle}>
        {animTypes.map(t => <option key={t} value={t}>{t === 'none' ? 'None' : t}</option>)}
      </select>

      {animType === 'beam' && (
        <input type="color" value={beamColor} onChange={e => { setBeamColor(e.target.value); applyEdgeAnimation('beam'); }}
          style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer' }} />
      )}
      <div style={{ flex: 1 }} />

      <label style={{ ...btnStyle, cursor: 'pointer' }}>
        📂 <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleUpload} />
      </label>
      <button onClick={handleDownload} style={btnStyle}>💾</button>
      <button onClick={() => { const n = themeMode === 'light' ? 'dark' : 'light'; setThemeMode(n); engine?.setTheme(n); }} style={btnStyle}>
        {themeMode === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '5px 10px', cursor: 'pointer', borderRadius: 4,
  background: 'rgba(255,255,255,0.08)', color: '#fff',
  border: '1px solid rgba(255,255,255,0.15)', fontSize: 11, fontFamily: 'inherit',
};

const accBtnStyle: React.CSSProperties = {
  ...btnStyle, background: 'var(--sf-edge-active, #00f2ff)', color: '#000', border: 'none', fontWeight: 'bold',
};

const selStyle: React.CSSProperties = {
  ...btnStyle, padding: '4px 6px', background: 'rgba(0,0,0,0.4)',
};

const dividerStyle: React.CSSProperties = {
  width: 1, height: 20, background: 'rgba(255,255,255,0.15)', margin: '0 2px',
};
