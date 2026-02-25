import React, { useState } from 'react';
import { SciFlow as ReactSciFlow, SciFlowMiniMap } from '@sci-flow/react';
import type { Node, Edge, SciFlow } from '@sci-flow/core';
import { MathNodeEx } from './MathNodeEx';
import { GeneratorNodeEx, ProcessorNodeEx, CombinerNodeEx, ViewerNodeEx, MultiNodeEx } from './NodeTypesEx';

const initialNodes: Node[] = [
  {
    id: 'n1', type: 'generator', position: { x: 50, y: 150 },
    data: { title: 'Signal' }, inputs: {},
    outputs: { out1: { id: 'out1', label: 'Value', type: 'output', dataType: 'number' } }
  },
  {
    id: 'n2', type: 'processor', position: { x: 300, y: 300 },
    data: { title: 'Distortion' },
    inputs: { in1: { id: 'in1', label: 'Input', type: 'input', dataType: 'number' } },
    outputs: {
      high: { id: 'high', label: 'High Pass', type: 'output', dataType: 'number' },
      low: { id: 'low', label: 'Low Pass', type: 'output', dataType: 'number' }
    }
  },
  {
    id: 'n3', type: 'viewer', position: { x: 600, y: 250 },
    data: { title: 'Scope' },
    inputs: { in1: { id: 'in1', label: 'Signal', type: 'input', dataType: 'number' } },
    outputs: {}
  }
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'out1', targetHandle: 'in1', animated: true, type: 'smart' },
  { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'high', targetHandle: 'in1', type: 'bezier' }
];

const kbdStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 3,
  fontSize: 10, marginRight: 4, border: '1px solid rgba(255,255,255,0.2)',
};

const btnStyle: React.CSSProperties = {
  padding: '6px 12px', cursor: 'pointer', borderRadius: '4px',
  background: 'rgba(255,255,255,0.08)', color: '#fff',
  border: '1px solid rgba(255,255,255,0.15)', fontSize: '12px',
  fontFamily: 'inherit', transition: 'background 0.15s',
};

const btnAccentStyle: React.CSSProperties = {
  ...btnStyle, background: 'var(--sf-edge-active, #00f2ff)',
  color: '#000', border: 'none', fontWeight: 'bold',
};

export const FullExampleApp = ({ theme = 'dark' }: { theme?: 'light' | 'dark' }) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(theme);
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [engine, setEngine] = useState<SciFlow | null>(null);
  const [animType, setAnimType] = useState<string>('dash');
  const [beamColor, setBeamColor] = useState<string>('#00f2ff');
  const [routingMode, setRoutingMode] = useState<string>('smart');
  const [lineStyle, setLineStyle] = useState<string>('solid');

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
    if (!engine) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => engine.fromJSON(ev.target?.result as string);
      reader.readAsText(file);
    }
  };

  const handleAddNode = () => {
    if (!engine) return;
    const state = engine.getState();
    const cx = -state.viewport.x + (800 / 2);
    const cy = -state.viewport.y + (600 / 2);
    const protos = [
      { type: 'generator', in: 0, out: 1, title: 'Waveform', outLabels: ['Out'], outTypes: ['number'] },
      { type: 'processor', in: 1, out: 2, title: 'Filter', inLabels: ['In'], outLabels: ['Sub', 'LFO'], inTypes: ['number'], outTypes: ['number', 'object'] },
      { type: 'combiner', in: 2, out: 1, title: 'Joiner', inLabels: ['A', 'B'], outLabels: ['Res'], inTypes: ['string', 'string'], outTypes: ['string'] },
      { type: 'viewer', in: 1, out: 0, title: 'Monitor', inLabels: ['Data'], inTypes: ['any'] },
    ];
    const proto = protos[Math.floor(Math.random() * protos.length)];
    const inputs: Record<string, Node['inputs'][string]> = {};
    for (let i = 0; i < proto.in; i++) {
      inputs[`in${i+1}`] = { id: `in${i+1}`, label: proto.inLabels?.[i] || `in${i+1}`, type: 'input', dataType: (proto.inTypes?.[i] || 'any') as any };
    }
    const outputs: Record<string, Node['outputs'][string]> = {};
    for (let i = 0; i < proto.out; i++) {
      outputs[`out${i+1}`] = { id: `out${i+1}`, label: proto.outLabels?.[i] || `out${i+1}`, type: 'output', dataType: (proto.outTypes?.[i] || 'any') as any };
    }
    engine.addNode({
      id: `node-${Date.now()}`, type: proto.type,
      position: { x: cx / state.viewport.zoom, y: cy / state.viewport.zoom },
      data: { title: proto.title }, inputs, outputs,
      style: { width: 160, height: 100 + Math.max(proto.in, proto.out) * 20 }
    });
  };

  const applyEdgeAnimation = (type: string) => {
    if (!engine) return;
    setAnimType(type);
    const state = engine.getState();
    if (type === 'none') {
      state.edges.forEach(edge => { edge.animated = false; edge.style = { ...edge.style, animationType: undefined }; });
    } else {
      const styleUpdate = { animationType: type as any, ...(type === 'beam' ? { animationColor: beamColor } : {}) };
      engine.setDefaultEdgeStyle(styleUpdate);
      state.edges.forEach(edge => { edge.animated = true; edge.style = { ...edge.style, ...styleUpdate }; });
    }
    engine.forceUpdate();
  };

  const applyBeamColor = (color: string) => {
    setBeamColor(color);
    if (!engine || animType !== 'beam') return;
    const state = engine.getState();
    state.edges.forEach(edge => {
      if (edge.animated && edge.style?.animationType === 'beam') {
        edge.style = { ...edge.style, animationColor: color };
      }
    });
    engine.forceUpdate();
  };

  const toggleDirection = () => {
    const next = direction === 'horizontal' ? 'vertical' : 'horizontal';
    setDirection(next);
    engine?.setDirection(next);
  };

  const applyRoutingMode = (mode: string) => {
    setRoutingMode(mode);
    if (!engine) return;
    engine.setDefaultEdgeType(mode as any);
    const state = engine.getState();
    state.edges.forEach((edge: any) => { edge.type = mode; });
    engine.forceUpdate();
  };

  const applyLineStyle = (style: string) => {
    setLineStyle(style);
    if (!engine) return;
    if (style === 'none') {
      engine.setDefaultEdgeStyle({ lineStyle: 'solid' });
      const state = engine.getState();
      state.edges.forEach(edge => { edge.style = { ...edge.style, lineStyle: undefined }; });
    } else {
      engine.setDefaultEdgeStyle({ lineStyle: style as any });
      const state = engine.getState();
      state.edges.forEach(edge => { edge.style = { ...edge.style, lineStyle: style as any }; });
    }
    engine.forceUpdate();
  };

  const animTypes = ['none', 'dash', 'dotted', 'pulse', 'arrows', 'symbols', 'beam'] as const;
  const lineStyles = ['none', 'solid', 'dashed', 'dotted'] as const;

  return (
    <div style={{ width: '100%', height: '800px', position: 'relative', border: '1px solid var(--vp-c-divider)', borderRadius: '8px', overflow: 'hidden', background: themeMode === 'dark' ? '#0e1116' : '#f8f9fa', display: 'flex', flexDirection: 'column' }}>

      {/* ─── TOP TOOLBAR ─── */}
      <div style={{ position: 'relative', zIndex: 100, display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
        {/* Node actions */}
        <button onClick={handleAddNode} style={btnAccentStyle}>+ Add Node</button>
        <button onClick={() => engine?.fitView()} style={btnStyle}>⊡ Fit View</button>
        <button onClick={toggleDirection} style={btnStyle}>
          {direction === 'horizontal' ? '⬇ Vertical' : '➡ Horizontal'}
        </button>
        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

        {/* Routing */}
        <select value={routingMode} onChange={e => applyRoutingMode(e.target.value)}
          style={{ ...btnStyle, padding: '5px 8px', background: 'rgba(0,0,0,0.4)' }}>
          <option value="bezier">Bezier</option>
          <option value="straight">Straight</option>
          <option value="step">Step</option>
          <option value="smart">Smart (A★)</option>
        </select>

        {/* Line style */}
        <select value={lineStyle} onChange={e => applyLineStyle(e.target.value)}
          style={{ ...btnStyle, padding: '5px 8px', background: 'rgba(0,0,0,0.4)' }}>
          {lineStyles.map(s => <option key={s} value={s}>{s === 'none' ? 'Line: —' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

        {/* Animation type */}
        <span style={{ fontSize: '11px', color: '#aaa' }}>Anim:</span>
        <select value={animType} onChange={e => applyEdgeAnimation(e.target.value)}
          style={{ ...btnStyle, padding: '5px 8px', background: 'rgba(0,0,0,0.4)' }}>
          {animTypes.map(t => <option key={t} value={t}>{t === 'none' ? 'None' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>

        {/* Beam color */}
        {animType === 'beam' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#aaa', cursor: 'pointer' }}>
            Color:
            <input type="color" value={beamColor} onChange={e => applyBeamColor(e.target.value)}
              style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 4, padding: 0 }} />
          </label>
        )}
        <div style={{ flex: 1 }} />

        {/* File tools */}
        <label style={{ ...btnStyle, cursor: 'pointer' }}>
          📂 Load
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleUpload} />
        </label>
        <button onClick={handleDownload} style={btnStyle}>💾 Save</button>
        <button onClick={() => { const next = themeMode === 'light' ? 'dark' : 'light'; setThemeMode(next); engine?.setTheme(next); }} style={btnStyle}>
          {themeMode === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {/* ─── CANVAS AREA ─── */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactSciFlow
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          renderer="auto"
          theme={themeMode}
          minZoom={0.2}
          maxZoom={4}
          nodeTypes={[MathNodeEx, GeneratorNodeEx, ProcessorNodeEx, CombinerNodeEx, ViewerNodeEx, MultiNodeEx] as any}
          onNodeContextMenu={(e, n) => { e.preventDefault(); alert(`Right clicked: ${n.id}`); }}
          onInit={setEngine}
          style={{ width: '100%', height: '100%' }}
        />

        <SciFlowMiniMap
          engine={engine}
          width={220}
          height={130}
          style={{
            position: 'absolute', bottom: '12px', right: '12px', zIndex: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px', overflow: 'hidden',
          }}
          nodeColor={themeMode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
          viewportColor={themeMode === 'dark' ? 'rgba(100,200,255,0.5)' : 'rgba(0,100,255,0.5)'}
        />

        {/* Keyboard hints */}
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', zIndex: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', padding: '8px 10px', borderRadius: '6px', color: 'white', fontFamily: 'sans-serif', fontSize: 11 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[['Ctrl+C','Copy'],['Ctrl+V','Paste'],['Ctrl+Z','Undo'],['Ctrl+Y','Redo'],['Del','Delete'],['↑↓←→','Nudge'],['Ctrl+A','All'],['Space','Pan']].map(([k,v]) => (
              <span key={k}><kbd style={kbdStyle}>{k}</kbd>{v}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
