import React from 'react';
import type { Node, SciFlow } from '@sci-flow/core';

export interface NodeComponentProps {
    node: Node;
    engine: SciFlow | null;
}

export const GeneratorNodeEx: React.FC<NodeComponentProps> & { nodeType?: string, renderCanvas?: (ctx: CanvasRenderingContext2D, node: Node) => void } = () => (
    <div style={{ padding: '0px' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#888' }}>Outputs a constant signal.</p>
        <div style={{ padding: 8, background: '#1a1a1a', borderRadius: 4, textAlign: 'center' }}>
            Value: 1.0
        </div>
    </div>
);
GeneratorNodeEx.nodeType = 'generator';
GeneratorNodeEx.renderCanvas = (ctx, node) => {
    ctx.fillText('Outputs a constant signal.', 7, 10);
    
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    const w = node.style?.width || 140;
    // Draw box for value
    ctx.roundRect?.(7, 25, w - 14, 25, 4); // Use local helper or rect if not available
    // Fallback if roundRect not supported (it is in modern browsers, but CanvasRenderer has a helper)
    // Actually, CanvasRenderer.ts has a private roundRect, I can't call it here.
    // I'll just use fillRect for now or simple lines.
    ctx.fillRect(7, 15, w - 14, 25);
    
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Value: 1.0', w / 2, 32);
    ctx.textAlign = 'left';
};

export const ProcessorNodeEx: React.FC<NodeComponentProps> & { nodeType?: string, renderCanvas?: (ctx: CanvasRenderingContext2D, node: Node) => void } = () => (
    <div style={{ padding: '0px' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Processes signal into filtered streams.</p>
    </div>
);
ProcessorNodeEx.nodeType = 'processor';
ProcessorNodeEx.renderCanvas = (ctx) => {
    ctx.fillText('Processes signal into filtered streams.', 7, 10);
};

export const CombinerNodeEx: React.FC<NodeComponentProps> & { nodeType?: string, renderCanvas?: (ctx: CanvasRenderingContext2D, node: Node) => void } = () => (
    <div style={{ padding: '0px' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Combines 2 signals into 1.</p>
    </div>
);
CombinerNodeEx.nodeType = 'combiner';
CombinerNodeEx.renderCanvas = (ctx) => {
    ctx.fillText('Combines 2 signals into 1.', 7, 10);
};

export const ViewerNodeEx: React.FC<NodeComponentProps> & { nodeType?: string, renderCanvas?: (ctx: CanvasRenderingContext2D, node: Node) => void } = () => (
    <div style={{ padding: '0px' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#888' }}>Visualizes input data.</p>
        <div style={{ width: '100%', height: 40, background: '#000', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '80%', height: 2, background: '#444' }}></div>
        </div>
    </div>
);
ViewerNodeEx.nodeType = 'viewer';
ViewerNodeEx.renderCanvas = (ctx, node) => {
    ctx.fillText('Visualizes input data.', 7, 10);
    
    ctx.fillStyle = '#000';
    const w = node.style?.width || 140;
    ctx.fillRect(7, 15, w - 14, 40);
    
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(15, 35);
    ctx.lineTo(w - 15, 35);
    ctx.stroke();
};

export const MultiNodeEx: React.FC<NodeComponentProps> & { nodeType?: string, renderCanvas?: (ctx: CanvasRenderingContext2D, node: Node) => void } = () => (
    <div style={{ padding: '0px' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Complex I/O Processor</p>
    </div>
);
MultiNodeEx.nodeType = 'multi';
MultiNodeEx.renderCanvas = (ctx) => {
    ctx.fillText('Complex I/O Processor', 7, 10);
};
