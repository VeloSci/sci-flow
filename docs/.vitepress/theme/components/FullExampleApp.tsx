import React, { useState } from 'react';
import { SciFlow as ReactSciFlow, SciFlowMiniMap } from '@sci-flow/react';
import type { Node, Edge, SciFlow } from '@sci-flow/core';
import { MathNodeEx } from './MathNodeEx';
import { GeneratorNodeEx, ProcessorNodeEx, CombinerNodeEx, ViewerNodeEx, MultiNodeEx } from './NodeTypesEx';
import { ExampleToolbar } from './ExampleToolbar';
import { NodePaletteDoc } from './NodePaletteDoc';
import { FeaturePanelDoc } from './FeaturePanelDoc';

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
  },
  {
    id: 'n4', type: 'combiner', position: { x: 550, y: 50 },
    data: { title: 'Mixer' },
    inputs: {
      in1: { id: 'in1', label: 'A', type: 'input', dataType: 'any' },
      in2: { id: 'in2', label: 'B', type: 'input', dataType: 'any' }
    },
    outputs: { out1: { id: 'out1', label: 'Mix', type: 'output', dataType: 'any' } }
  },
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'out1', targetHandle: 'in1', animated: true, type: 'smart' },
  { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'high', targetHandle: 'in1', type: 'bezier' },
  { id: 'e3', source: 'n1', target: 'n4', sourceHandle: 'out1', targetHandle: 'in1', type: 'step', data: { label: 'Signal A' } },
  { id: 'e4', source: 'n2', target: 'n4', sourceHandle: 'low', targetHandle: 'in2', type: 'bezier', data: { label: 'Low Pass' } },
];

const kbdStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: 3,
  fontSize: 9, marginRight: 3, border: '1px solid rgba(255,255,255,0.2)',
};

export const FullExampleApp = ({ theme = 'dark' }: { theme?: 'light' | 'dark' }) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(theme);
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [engine, setEngine] = useState<SciFlow | null>(null);

  const toggleDirection = () => {
    const next = direction === 'horizontal' ? 'vertical' : 'horizontal';
    setDirection(next);
    engine?.setDirection(next);
  };

  return (
    <div style={{ width: '100%', height: '800px', position: 'relative', border: '1px solid var(--vp-c-divider)', borderRadius: 8, overflow: 'hidden', background: themeMode === 'dark' ? '#0e1116' : '#f8f9fa', display: 'flex', flexDirection: 'column' }}>

      <ExampleToolbar
        engine={engine} themeMode={themeMode} setThemeMode={setThemeMode}
        direction={direction} toggleDirection={toggleDirection}
      />

      <div style={{ flex: 1, position: 'relative' }}>
        <ReactSciFlow
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          renderer="auto"
          theme={themeMode}
          minZoom={0.1}
          maxZoom={5}
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          nodeTypes={[MathNodeEx, GeneratorNodeEx, ProcessorNodeEx, CombinerNodeEx, ViewerNodeEx, MultiNodeEx] as any}
          onNodeContextMenu={(e, n) => { e.preventDefault(); alert(`Node: ${n.id}`); }}
          onInit={setEngine}
          style={{ width: '100%', height: '100%' }}
        />

        {/* New feature panels */}
        <NodePaletteDoc />
        <FeaturePanelDoc engine={engine} />

        <SciFlowMiniMap
          engine={engine} width={200} height={120}
          style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' }}
          nodeColor={themeMode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
          viewportColor={themeMode === 'dark' ? 'rgba(100,200,255,0.5)' : 'rgba(0,100,255,0.5)'}
        />

        {/* Keyboard hints */}
        <div style={{ position: 'absolute', bottom: 10, left: 190, zIndex: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', padding: '6px 8px', borderRadius: 5, color: '#fff', fontSize: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['Ctrl+C','Copy'],['Ctrl+Z','Undo'],['Del','Del'],['↑↓←→','Nudge'],['Ctrl+A','All'],['Space','Pan']].map(([k,v]) => (
              <span key={k}><kbd style={kbdStyle}>{k}</kbd>{v}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
