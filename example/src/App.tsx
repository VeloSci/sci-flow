import { useState } from 'react';
import { SciFlow, SciFlowMiniMap } from '@sci-flow/react';
import { MathNode } from './components/MathNode';

const initialNodes = [
  {
    id: 'n1',
    type: 'math-node',
    position: { x: 100, y: 100 },
    data: { title: 'Addition' },
    inputs: {},
    outputs: {},
    style: { width: 180, height: 120 }
  },
  {
    id: 'n2',
    type: 'math-node',
    position: { x: 400, y: 200 },
    data: { title: 'Multiplication' },
    inputs: {},
    outputs: {},
    style: { width: 180, height: 120 }
  },
  {
    id: 'n3',
    type: 'basic',
    position: { x: 700, y: 150 },
    data: {},
    inputs: {},
    outputs: {},
    style: { width: 150, height: 80 }
  }
];

const initialEdges = [
  { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'out1', targetHandle: 'in1', animated: true, type: 'smart' },
  { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'out1', targetHandle: 'in1', type: 'bezier' }
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

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1000, display: 'flex', gap: '8px' }}>
            <label style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '4px', background: 'var(--sf-node-bg, #333)', color: 'var(--sf-node-text, #fff)', border: '1px solid var(--sf-node-border, #444)' }}>
                Load JSON
                <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleUpload} />
            </label>
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

        <SciFlow 
            initialNodes={initialNodes}
            initialEdges={initialEdges}
            renderer="auto"
            theme={themeMode}
            minZoom={0.2}
            maxZoom={4}
            nodeTypes={[MathNode]}
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
    </div>
  )
}

export default App;
