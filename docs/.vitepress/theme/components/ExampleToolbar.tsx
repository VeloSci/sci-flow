import React, { useState } from 'react';
import type { SciFlow, Edge } from '@sci-flow/core';
import { Plus, Maximize, GitMerge, FileDown, FileUp, Sun, Moon } from 'lucide-react';
import { EdgeAnimationSelector } from './EdgeAnimationSelector';

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

  const lineStyles = ['none', 'solid', 'dashed', 'dotted'];

  const btnClasses = "flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[11px] font-medium transition-colors";
  const accBtnClasses = "flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-black border-none text-[11px] font-bold transition-colors";
  const selClasses = "flex items-center px-2 py-1.5 rounded cursor-pointer bg-black/40 text-white border border-white/20 text-[11px] font-medium transition-colors outline-none";
  const dividerClasses = "w-[1px] h-5 bg-white/20 mx-1";

  return (
    <div className="relative z-[100] flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md border-b border-white/10 flex-wrap">
      <button onClick={handleAddNode} className={accBtnClasses}><Plus size={14}/> Add Node</button>
      <button onClick={() => engine?.fitView()} className={btnClasses}><Maximize size={14}/> Fit</button>
      <button onClick={toggleDirection} className={btnClasses}>
        <GitMerge size={14} className={direction === 'horizontal' ? 'rotate-90' : ''} />
        {direction === 'horizontal' ? 'Vert' : 'Horiz'}
      </button>
      <div className={dividerClasses} />

      <select value={routingMode} onChange={e => applyRoutingMode(e.target.value)} className={selClasses}>
        <option value="bezier">Bezier</option>
        <option value="straight">Straight</option>
        <option value="step">Step</option>
        <option value="smart">Smart(A★)</option>
      </select>

      <select value={lineStyle} onChange={e => applyLineStyle(e.target.value)} className={selClasses}>
        {lineStyles.map(s => <option key={s} value={s}>{s === 'none' ? 'Line:—' : s}</option>)}
      </select>
      <div className={dividerClasses} />

      <div className={dividerClasses} />
      <EdgeAnimationSelector 
        currentAnim={animType} 
        onSelect={applyEdgeAnimation} 
        lineStyle={lineStyle as 'solid' | 'dashed' | 'dotted'} 
      />

      {animType === 'beam' && (
        <input type="color" value={beamColor} onChange={e => { setBeamColor(e.target.value); applyEdgeAnimation('beam'); }}
          className="w-6 h-6 border-none bg-transparent cursor-pointer rounded-full overflow-hidden" />
      )}
      <div className="flex-1" />

      <label className={`${btnClasses} cursor-pointer`}>
        <FileUp size={14}/>
        <input type="file" accept=".json" className="hidden" onChange={handleUpload} />
      </label>
      <button onClick={handleDownload} className={btnClasses}><FileDown size={14}/></button>
      <button onClick={() => { const n = themeMode === 'light' ? 'dark' : 'light'; setThemeMode(n); engine?.setTheme(n); }} className={btnClasses}>
        {themeMode === 'dark' ? <Sun size={14}/> : <Moon size={14}/>}
      </button>
    </div>
  );
}
