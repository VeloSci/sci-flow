import React from 'react';

export const MathNode = ({ node, engine }: any) => {
    const updateData = (newData: any) => {
        if (!engine) return;
        const state = (engine as any).stateManager.getState();
        const n = state.nodes.get(node.id);
        if (n) {
            n.data = { ...n.data, ...newData };
            (engine as any).stateManager.forceUpdate();
        }
    };

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
                    value={node.data.a || 0} 
                    onChange={(e) => updateData({ a: parseFloat(e.target.value) })}
                    style={inputStyle}
                />
                <span style={{ color: '#888' }}>+</span>
                <input 
                    type="number" 
                    value={node.data.b || 0} 
                    onChange={(e) => updateData({ b: parseFloat(e.target.value) })}
                    style={inputStyle}
                />
            </div>
            <div style={{ background: '#1a1a1a', padding: '8px', borderRadius: '4px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', color: 'var(--sf-edge-active)' }}>
                Result: {(node.data.a || 0) + (node.data.b || 0)}
            </div>
        </div>
    );
};

// Static bind for the wrapper mapping
(MathNode as any).nodeType = 'math-node';
