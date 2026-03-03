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

export const FullExampleApp = ({ theme = 'dark', renderer = 'auto' }: { theme?: 'light' | 'dark', renderer?: 'svg' | 'canvas' | 'auto' }) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(theme);
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [engine, setEngine] = useState<SciFlow | null>(null);

  const toggleDirection = () => {
    const next = direction === 'horizontal' ? 'vertical' : 'horizontal';
    setDirection(next);
    engine?.setDirection(next);
  };

  React.useEffect(() => {
    if (engine) {
      engine.stateManager.registerNodeType({
        type: 'generator',
        evaluate: () => ({ out1: Math.random() * 100 })
      });
      engine.stateManager.registerNodeType({
        type: 'processor',
        evaluate: (inputs) => ({
          high: (inputs.in1 as number || 0) * 1.5,
          low: (inputs.in1 as number || 0) * 0.5
        })
      });
      engine.stateManager.registerNodeType({
        type: 'combiner',
        evaluate: (inputs) => ({
          out1: (inputs.in1 as number || 0) + (inputs.in2 as number || 0)
        })
      });
      engine.stateManager.registerNodeType({
        type: 'viewer',
        evaluate: (inputs) => ({ result: inputs.in1 })
      });

      // Add a sticky note if none exists
      if (engine.plugins.stickyNotes.getAll().length === 0) {
        engine.plugins.stickyNotes.add(
          'Welcome to Sci-Flow Playground!\nDrag me around and try connecting nodes.',
          50, 50, '#ffb74d'
        );
      }
    }
  }, [engine]);

  return (
    <div className={`w-full h-[800px] relative border rounded-lg overflow-hidden flex flex-col ${themeMode === 'dark' ? 'bg-[#0e1116] border-white/10' : 'bg-[#f8f9fa] border-black/10'}`}>

      <ExampleToolbar
        engine={engine} themeMode={themeMode} setThemeMode={setThemeMode}
        direction={direction} toggleDirection={toggleDirection}
      />

      <div className="flex-1 relative">
        <ReactSciFlow
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          renderer={renderer}
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

        <div className="absolute bottom-2.5 right-2.5 z-10 shadow-xl rounded-md overflow-hidden border border-white/10">
          <SciFlowMiniMap
            engine={engine} width={200} height={120}
            nodeColor={themeMode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
            viewportColor={themeMode === 'dark' ? 'rgba(100,200,255,0.5)' : 'rgba(0,100,255,0.5)'}
          />
        </div>

        {/* Keyboard hints */}
        <div className="absolute bottom-2.5 left-[190px] z-10 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-md text-white text-[10px]">
          <div className="flex gap-2 flex-wrap">
            {[['Ctrl+C','Copy'],['Ctrl+Z','Undo'],['Del','Del'],['↑↓←→','Nudge'],['Space','Pan'], ['F', 'Fit View']].map(([k,v]) => (
              <span key={k} className="flex items-center gap-1">
                <kbd className="bg-white/10 px-1.5 py-0.5 rounded-[3px] text-[9px] border border-white/20 font-mono tracking-tighter">{k}</kbd>{v}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
