import React from 'react';
import type { Node, SciFlow } from '@sci-flow/core';

export interface MathNodeProps {
    node: Node;
    engine: SciFlow | null;
}

export const MathNodeEx: React.FC<MathNodeProps> & { 
    nodeType?: string,
    renderCanvas?: (ctx: CanvasRenderingContext2D, node: Node) => void 
} = ({ node, engine }) => {
    const updateData = (newData: Partial<{ a: number; b: number }>) => {
        if (!engine) return;
        const state = engine.stateManager.getState();
        const n = state.nodes.get(node.id);
        if (n) {
            n.data = { ...n.data, ...newData };
            engine.stateManager.forceUpdate();
        }
    };

    const data = (node.data || {}) as { a?: number; b?: number };

    const inputStyle: React.CSSProperties = {
        width: '40px',
        padding: '4px',
        background: '#333',
        border: '1px solid #444',
        color: '#fff',
        borderRadius: '4px',
        fontSize: '12px',
        textAlign: 'center'
    };

    return (
        <div style={{ padding: '0px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center', justifyContent: 'center' }}>
                <input 
                    type="number" 
                    value={data.a || 0} 
                    onChange={(e) => updateData({ a: parseFloat(e.target.value) })}
                    style={inputStyle}
                />
                <span style={{ color: '#888' }}>+</span>
                <input 
                    type="number" 
                    value={data.b || 0} 
                    onChange={(e) => updateData({ b: parseFloat(e.target.value) })}
                    style={inputStyle}
                />
            </div>
            <div style={{ background: '#1a1a1a', padding: '8px', borderRadius: '4px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', color: 'var(--sf-edge-active)' }}>
                Result: {(data.a || 0) + (data.b || 0)}
            </div>
        </div>
    );
};

MathNodeEx.nodeType = 'math-node';
MathNodeEx.renderCanvas = (ctx, node) => {
    const data = (node.data || {}) as { a?: number; b?: number };
    const w = node.style?.width || 140;
    
    ctx.save();
    ctx.translate(0, 5); // Start with some padding
    
    // Inputs (fake)
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.roundRect?.(10, 0, 40, 24, 4); ctx.fill();
    ctx.beginPath(); ctx.roundRect?.(w - 50, 0, 40, 24, 4); ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(data.a || 0), 30, 16);
    ctx.fillText(String(data.b || 0), w - 30, 16);
    
    ctx.fillStyle = '#888';
    ctx.fillText('+', w / 2, 16);
    
    // Result
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.roundRect?.(10, 28, w - 20, 28, 4); ctx.fill();
    
    ctx.fillStyle = '#45a3e5'; // Approximate var(--sf-edge-active)
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(`Result: ${(data.a || 0) + (data.b || 0)}`, w / 2, 47);
    
    ctx.restore();
};
