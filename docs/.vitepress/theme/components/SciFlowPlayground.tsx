import React, { useState } from 'react';
import { SciFlow, SciFlowMiniMap } from '@sci-flow/react';
import type { SciFlow as SciFlowEngine, Node, Edge, DataType } from '@sci-flow/core';
import { MathNode } from './MathNode';
import { GeneratorNode, ProcessorNode, CombinerNode, ViewerNode, MultiNode } from './NodeTypes';

const initialNodes: Node[] = [
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

const initialEdges: Edge[] = [
    { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'out1', targetHandle: 'in1', animated: true, type: 'smart' },
    { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'high', targetHandle: 'in1', type: 'bezier' }
];

const kbdStyle: React.CSSProperties = {
    background: '#333',
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: 11,
    marginRight: 4,
    border: '1px solid #555'
};

export const SciFlowPlayground = ({ theme = 'dark' }: { theme?: 'light' | 'dark' }) => {
    const [engine, setEngine] = useState<SciFlowEngine | null>(null);

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
        // Use core engine methods directly
        const centerViewportX = -state.viewport.x + (600 / 2); // Assume smaller default width for docs
        const centerViewportY = -state.viewport.y + (400 / 2);

        interface NodePrototype {
            type: string;
            in: number;
            out: number;
            title: string;
            inLabels?: string[];
            outLabels?: string[];
            inTypes?: string[];
            outTypes?: string[];
        }

        const nodePrototypes: NodePrototype[] = [
            { type: 'generator', in: 0, out: 1, title: 'Waveform', outLabels: ['Out'], outTypes: ['number'] },
            { type: 'processor', in: 1, out: 2, title: 'Filter', inLabels: ['In'], outLabels: ['Sub', 'LFO'], inTypes: ['number'], outTypes: ['number', 'object'] },
            { type: 'combiner', in: 2, out: 1, title: 'Joiner', inLabels: ['A', 'B'], outLabels: ['Res'], inTypes: ['string', 'string'], outTypes: ['string'] },
            { type: 'viewer', in: 1, out: 0, title: 'Monitor', inLabels: ['Data'], inTypes: ['any'] },
            { type: 'multi', in: 3, out: 3, title: 'Advanced', inLabels: ['X', 'Y', 'Z'], outLabels: ['Alpha', 'Beta', 'Gamma'], inTypes: ['number', 'number', 'number'], outTypes: ['number', 'boolean', 'any'] },
        ];

        const proto = nodePrototypes[Math.floor(Math.random() * nodePrototypes.length)];

        const inputs: Node['inputs'] = {};
        for (let i = 0; i < proto.in; i++) {
            const label = proto.inLabels?.[i] || `in${i + 1} `;
            const typeValue = proto.inTypes?.[i] || 'any';
            inputs[`in${i + 1} `] = { id: `in${i + 1} `, label, type: 'input', dataType: typeValue as DataType };
        }

        const outputs: Node['outputs'] = {};
        for (let i = 0; i < proto.out; i++) {
            const label = proto.outLabels?.[i] || `out${i + 1} `;
            const typeValue = proto.outTypes?.[i] || 'any';
            outputs[`out${i + 1} `] = { id: `out${i + 1} `, label, type: 'output', dataType: typeValue as DataType };
        }

        const newNode: Node = {
            id: `node - ${Date.now()} `,
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

    const handleAddNote = () => {
        if (!engine) return;
        const state = engine.getState();
        const centerViewportX = -state.viewport.x + (600 / 2);
        const centerViewportY = -state.viewport.y + (400 / 2);
        engine.plugins.stickyNotes.add('Note', centerViewportX / state.viewport.zoom, centerViewportY / state.viewport.zoom);
    };

    return (
        <div style={{ width: '100%', height: '600px', position: 'relative', border: '1px solid var(--vp-c-divider)', borderRadius: '8px', overflow: 'hidden', background: '#121417' }}>
            <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1000, display: 'flex', gap: '8px' }}>
                <label style={{ padding: '4px 12px', cursor: 'pointer', borderRadius: '4px', background: 'var(--sf-node-bg, #333)', color: 'var(--sf-node-text, #fff)', border: '1px solid var(--sf-node-border, #444)', fontSize: '11px' }}>
                    Load
                    <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleUpload} />
                </label>
                <button
                    onClick={handleAddNode}
                    style={{ padding: '4px 12px', cursor: 'pointer', borderRadius: '4px', background: 'var(--sf-edge-active, #00f2ff)', color: '#000', border: 'none', fontWeight: 'bold', fontSize: '11px' }}
                >
                    + Node
                </button>
                <button
                    onClick={handleAddNote}
                    style={{ padding: '4px 12px', cursor: 'pointer', borderRadius: '4px', background: '#ffd93d', color: '#000', border: 'none', fontWeight: 'bold', fontSize: '11px' }}
                >
                    + Note
                </button>
                <button
                    onClick={handleDownload}
                    style={{ padding: '4px 12px', cursor: 'pointer', borderRadius: '4px', background: 'var(--sf-node-bg, #333)', color: 'var(--sf-node-text, #fff)', border: '1px solid var(--sf-node-border, #444)', fontSize: '11px' }}
                >
                    Save
                </button>
            </div>

            <SciFlow
                initialNodes={initialNodes}
                initialEdges={initialEdges}
                renderer="auto"
                theme={theme}
                nodeTypes={[MathNode, GeneratorNode, ProcessorNode, CombinerNode, ViewerNode, MultiNode]}
                onInit={(engineInstance) => setEngine(engineInstance)}
            />

            <SciFlowMiniMap
                engine={engine}
                width={150}
                height={100}
                style={{
                    bottom: '10px',
                    right: '10px',
                    boxShadow: '0 5px 10px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            />

            <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, background: 'rgba(0,0,0,0.7)', padding: '8px 12px', borderRadius: 8, color: 'white', fontFamily: 'sans-serif' }}>
                <h5 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>Playground</h5>
                <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>Full interactive demo with Portals.</p>
            </div>

            <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 10, background: 'rgba(0,0,0,0.7)', padding: '8px 12px', borderRadius: 8, color: 'white', fontFamily: 'sans-serif', fontSize: 9 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span><kbd style={kbdStyle}>Z</kbd> Undo</span>
                    <span><kbd style={kbdStyle}>Y</kbd> Redo</span>
                    <span><kbd style={kbdStyle}>Del</kbd> Delete</span>
                    <span><kbd style={kbdStyle}>Space</kbd> Pan</span>
                </div>
            </div>
        </div>
    );
};
