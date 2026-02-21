

export const MathNode = ({ node }: any) => {
    return (
        <div style={{
            background: 'var(--sf-node-bg, #1e293b)',
            border: node.selected ? '2px solid var(--sf-edge-active, #5a9df8)' : '1px solid var(--sf-node-border, #444)',
            borderRadius: '8px',
            color: 'var(--sf-node-text, #fff)',
            width: '200px', // Explicit size for standard nodes, preventing 1x1 collapse since foreignObject is 1x1 overflow
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'monospace'
        }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--sf-node-border, #444)', background: 'rgba(0,0,0,0.2)' }}>
                <strong>{node.data?.title || 'Math Op'}</strong>
            </div>
            <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ background: '#222', padding: '4px', borderRadius: '4px', border: '1px solid #333' }}>In A</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ background: '#222', padding: '4px', borderRadius: '4px', border: '1px solid #333' }}>In B</div>
                    <div className="sci-flow-port" data-nodeid={node.id} data-portid="out1" 
                         style={{ 
                            background: 'var(--sf-port-bg)', 
                            border: '2px solid var(--sf-port-border)', 
                            borderRadius: '50%', 
                            width: '16px', 
                            height: '16px',
                            cursor: 'crosshair',
                            position: 'relative',
                            right: '-20px' // Pull it outside slightly
                         }} />
                </div>
            </div>
        </div>
    );
};

// Static bind for the wrapper mapping
(MathNode as any).nodeType = 'math-node';
