
export const GeneratorNode = () => (
    <div style={{ padding: '0px' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#888' }}>Outputs a constant signal.</p>
        <div style={{ padding: 8, background: '#1a1a1a', borderRadius: 4, textAlign: 'center' }}>
            Value: 1.0
        </div>
    </div>
);
(GeneratorNode as any).nodeType = 'generator';

export const ProcessorNode = () => (
    <div style={{ padding: '0px' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Processes signal into filtered streams.</p>
    </div>
);
(ProcessorNode as any).nodeType = 'processor';

export const CombinerNode = () => (
    <div style={{ padding: '0px' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Combines 2 signals into 1.</p>
    </div>
);
(CombinerNode as any).nodeType = 'combiner';

export const ViewerNode = () => (
    <div style={{ padding: '0px' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#888' }}>Visualizes input data.</p>
        <div style={{ width: '100%', height: 40, background: '#000', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '80%', height: 2, background: '#444' }}></div>
        </div>
    </div>
);
(ViewerNode as any).nodeType = 'viewer';

export const MultiNode = () => (
    <div style={{ padding: '0px' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>Complex I/O Processor</p>
    </div>
);
(MultiNode as any).nodeType = 'multi';
