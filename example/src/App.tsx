import { useState } from 'react';
import { SciFlow, SciFlowMiniMap } from '@sci-flow/react';
import { MathNode } from './components/MathNode';
import { GeneratorNode, ProcessorNode, CombinerNode, ViewerNode, MultiNode } from './components/NodeTypes';

const initialNodes: any[] = [
  {
    id: 'n1',
    type: 'generator',
    position: { x: 50, y: 150 },
    data: { title: 'Signal' },
    inputs: {},
    outputs: { out1: { id: 'out1', label: 'Value', type: 'output', dataType: 'number' } }
  },
  {
    id: 'n2',
    type: 'processor',
    position: { x: 300, y: 300 },
    data: { title: 'Distortion' },
    inputs: { in1: { id: 'in1', label: 'Input', type: 'input', dataType: 'number' } },
    outputs: {
        high: { id: 'high', label: 'High Pass', type: 'output', dataType: 'number' },
        low: { id: 'low', label: 'Low Pass', type: 'output', dataType: 'number' }
    }
  },
  {
    id: 'n3',
    type: 'viewer',
    position: { x: 600, y: 250 },
    data: { title: 'Scope' },
    inputs: { in1: { id: 'in1', label: 'Signal', type: 'input', dataType: 'number' } },
    outputs: {}
  }
];

const initialEdges: any[] = [
  { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'out1', targetHandle: 'in1', animated: true, type: 'smart' },
  { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'high', targetHandle: 'in1', type: 'bezier' }
];

function App() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [engine, setEngine] = useState<any>(null);

  const handleDownload = () => {
      if (!engine) return;
      const json = engine.toJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sciflow-state.json';
      a.click();
      URL.revokeObjectURL(url);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!engine) return;
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              const json = ev.target?.result as string;
              engine.fromJSON(json);
          };
          reader.readAsText(file);
      }
  };

  const handleAddNode = () => {
      if (!engine) return;
      
      const state = engine.getState();
      const centerViewportX = -state.viewport.x + (window.innerWidth / 2);
      const centerViewportY = -state.viewport.y + (window.innerHeight / 2);
      
      const nodePrototypes = [
        { type: 'generator', in: 0, out: 1, title: 'Waveform', outLabels: ['Out'], outTypes: ['number'] },
        { type: 'processor', in: 1, out: 2, title: 'Filter', inLabels: ['In'], outLabels: ['Sub', 'LFO'], inTypes: ['number'], outTypes: ['number', 'object'] },
        { type: 'combiner', in: 2, out: 1, title: 'Joiner', inLabels: ['A', 'B'], outLabels: ['Res'], inTypes: ['string', 'string'], outTypes: ['string'] },
        { type: 'viewer', in: 1, out: 0, title: 'Monitor', inLabels: ['Data'], inTypes: ['any'] },
        { type: 'multi', in: 3, out: 3, title: 'Advanced', inLabels: ['X', 'Y', 'Z'], outLabels: ['Alpha', 'Beta', 'Gamma'], inTypes: ['number', 'number', 'number'], outTypes: ['number', 'boolean', 'any'] },
      ];

      const proto = nodePrototypes[Math.floor(Math.random() * nodePrototypes.length)];

      const inputs: any = {};
      for (let i = 0; i < proto.in; i++) {
          const label = proto.inLabels?.[i] || `in${i+1}`;
          const type = proto.inTypes?.[i] || 'any';
          inputs[`in${i+1}`] = { id: `in${i+1}`, label, type: 'input', dataType: type };
      }
      
      const outputs: any = {};
      for (let i = 0; i < proto.out; i++) {
          const label = proto.outLabels?.[i] || `out${i+1}`;
          const type = proto.outTypes?.[i] || 'any';
          outputs[`out${i+1}`] = { id: `out${i+1}`, label, type: 'output', dataType: type };
      }

      const newNode = {
          id: `node-${Date.now()}`,
          type: proto.type,
          position: { 
              x: centerViewportX / state.viewport.zoom, 
              y: centerViewportY / state.viewport.zoom 
            },
          data: { title: proto.title },
          inputs,
          outputs,
          style: { width: 160, height: 100 + (Math.max(proto.in, proto.out) * 20) }
      };
      
      engine.addNode(newNode);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1000, display: 'flex', gap: '8px' }}>
            <label style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '4px', background: 'var(--sf-node-bg, #333)', color: 'var(--sf-node-text, #fff)', border: '1px solid var(--sf-node-border, #444)' }}>
                Load JSON
                <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleUpload} />
            </label>
            <button 
                onClick={handleAddNode}
                style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '4px', background: 'var(--sf-edge-active, #00f2ff)', color: '#000', border: 'none', fontWeight: 'bold' }}
            >
                + Add Node
            </button>
            <button 
                onClick={handleDownload}
                style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '4px', background: 'var(--sf-node-bg, #333)', color: 'var(--sf-node-text, #fff)', border: '1px solid var(--sf-node-border, #444)' }}
            >
                Save JSON
            </button>
            <button 
                onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '4px', background: 'var(--sf-node-bg, #333)', color: 'var(--sf-node-text, #fff)', border: '1px solid var(--sf-node-border, #444)' }}
            >
                Theme: {themeMode.toUpperCase()}
            </button>
        </div>

        <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, background: 'rgba(0,0,0,0.8)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '250px' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>Edge Controls</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#888' }}>Routing Mode</label>
                <select 
                    onChange={(e) => {
                        if (!engine) return;
                        engine.setDefaultEdgeType(e.target.value as any);
                        
                        // Also apply to all existing edges to keep everything in sync
                        const state = engine.getState();
                        state.edges.forEach((edge: any) => {
                            edge.type = e.target.value;
                        });
                        engine.forceUpdate();
                    }}
                    style={{ background: '#222', color: '#fff', border: '1px solid #444', padding: '4px', borderRadius: '4px' }}
                >
                    <option value="bezier">Bezier (Spline)</option>
                    <option value="straight">Straight</option>
                    <option value="step">Step (Right Angles)</option>
                    <option value="smart">Smart (A-Star)</option>
                </select>

                <label style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>Line Style</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {['solid', 'dashed', 'dotted'].map(style => (
                        <button 
                            key={style}
                            onClick={() => {
                                if (!engine) return;
                                engine.setDefaultEdgeStyle({ lineStyle: style });
                                
                                // Also apply to all existing edges
                                const state = engine.getState();
                                state.edges.forEach((edge: any) => {
                                    edge.style = { ...edge.style, lineStyle: style };
                                });
                                engine.forceUpdate();
                            }}
                            style={{ flex: 1, padding: '4px', fontSize: '11px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            {style}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <SciFlow 
            initialNodes={initialNodes}
            initialEdges={initialEdges}
            renderer="auto"
            theme={themeMode}
            minZoom={0.2}
            maxZoom={4}
            nodeTypes={[MathNode, GeneratorNode, ProcessorNode, CombinerNode, ViewerNode, MultiNode]}
            onNodeContextMenu={(e: any, n: any) => { e.preventDefault(); alert(`Right clicked ${n.id}`); }}
            onInit={(engineInstance: any) => setEngine(engineInstance)}
        />
        
        {/* React Minimap wrapper automatically syncing with engine */}
        <SciFlowMiniMap 
            engine={engine} 
            width={250} 
            height={150} 
            style={{ 
               bottom: '20px', 
               right: '20px', 
               boxShadow: '0 10px 15px rgba(0,0,0,0.5)',
               border: '1px solid rgba(255,255,255,0.1)'
           }} 
           nodeColor={themeMode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
           viewportColor={themeMode === 'dark' ? 'rgba(100, 200, 255, 0.5)' : 'rgba(0, 100, 255, 0.5)'}
        />

        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: 8, color: 'white', fontFamily: 'sans-serif' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>@sci-flow/react</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#aaa' }}>Drag nodes to see <strong>Smart Routing (A-Star)</strong> and native Portal injections.</p>
            <button 
                onClick={() => engine?.fitView()}
                style={{ marginTop: 10, padding: '5px 10px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
                Fit View
            </button>
        </div>

        <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.7)', padding: '12px 16px', borderRadius: 8, color: 'white', fontFamily: 'sans-serif', fontSize: 12 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                <span><kbd style={kbdStyle}>Ctrl+C</kbd> Copy</span>
                <span><kbd style={kbdStyle}>Ctrl+V</kbd> Paste</span>
                <span><kbd style={kbdStyle}>Ctrl+Z</kbd> Undo</span>
                <span><kbd style={kbdStyle}>Ctrl+Y</kbd> Redo</span>
                <span><kbd style={kbdStyle}>Del</kbd> Delete</span>
                <span><kbd style={kbdStyle}>↑↓←→</kbd> Nudge</span>
                <span><kbd style={kbdStyle}>Shift+↑</kbd> Nudge 10px</span>
                <span><kbd style={kbdStyle}>Ctrl+A</kbd> Select All</span>
                <span><kbd style={kbdStyle}>Space+Drag</kbd> Pan</span>
                <span><kbd style={kbdStyle}>Scroll</kbd> Zoom</span>
            </div>
        </div>
    </div>
  )
}

const kbdStyle: React.CSSProperties = {
    background: '#333',
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: 11,
    marginRight: 4,
    border: '1px solid #555'
};

export default App;
