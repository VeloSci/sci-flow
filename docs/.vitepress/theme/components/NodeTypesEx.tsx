import React from 'react';
import type { Node, SciFlow } from '@sci-flow/core';

export interface NodeComponentProps {
    node: Node;
    engine: SciFlow | null;
}

export const GeneratorNodeEx: React.FC<NodeComponentProps> = () => (
    <div style={{ padding: '0px' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#888' }}>Outputs a constant signal.</p>
        <div style={{ padding: 8, background: '#1a1a1a', borderRadius: 4, textAlign: 'center' }}>
            Value: 1.0
        </div>
    </div>
);
(GeneratorNodeEx as any).nodeType = 'generator';

export const ProcessorNodeEx: React.FC<NodeComponentProps> = () => (
    <div style={{ padding: '0px' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Processes signal into filtered streams.</p>
    </div>
);
(ProcessorNodeEx as any).nodeType = 'processor';

export const CombinerNodeEx: React.FC<NodeComponentProps> = () => (
    <div style={{ padding: '0px' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Combines 2 signals into 1.</p>
    </div>
);
(CombinerNodeEx as any).nodeType = 'combiner';

export const ViewerNodeEx: React.FC<NodeComponentProps> = () => (
    <div style={{ padding: '0px' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#888' }}>Visualizes input data.</p>
        <div style={{ width: '100%', height: 40, background: '#000', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '80%', height: 2, background: '#444' }}></div>
        </div>
    </div>
);
(ViewerNodeEx as any).nodeType = 'viewer';

export const MultiNodeEx: React.FC<NodeComponentProps> = () => (
    <div style={{ padding: '0px' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Complex I/O Processor</p>
    </div>
);
(MultiNodeEx as any).nodeType = 'multi';
