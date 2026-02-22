

export const MathNode = ({ node }: any) => {
    return (
        <>
            <div className="sci-flow-node-header">
                {node.data?.title || 'Math Op'}
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></div>
            </div>
            <div className="sci-flow-node-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#aaa' }}>Color 1</span>
                        <div style={{ width: 40, height: 14, background: '#e38634', borderRadius: '2px' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#aaa' }}>Color 2</span>
                        <div style={{ width: 40, height: 14, background: '#fff', borderRadius: '2px' }}></div>
                    </div>
                    <div style={{ marginTop: '4px', textAlign: 'right', fontSize: '10px', opacity: 0.4 }}>
                        {node.id}
                    </div>
                </div>
            </div>
        </>
    );
};

// Static bind for the wrapper mapping
(MathNode as any).nodeType = 'math-node';
