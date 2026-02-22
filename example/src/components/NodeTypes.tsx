
export const GeneratorNode = () => (
    <>
        <div className="sci-flow-node-header" style={{ backgroundColor: 'var(--sf-node-header-input)' }}>
            Generator
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff' }}></div>
        </div>
        <div className="sci-flow-node-body">
            Outputs a constant signal.
            <div style={{ marginTop: 8, padding: 4, background: '#1a1a1a', borderRadius: 4, textAlign: 'center' }}>
                Value: 1.0
            </div>
        </div>
    </>
);
(GeneratorNode as any).nodeType = 'generator';

export const ProcessorNode = () => (
    <>
        <div className="sci-flow-node-header">
            Processor
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff4d4d' }}></div>
        </div>
        <div className="sci-flow-node-body">
            Processes 1 input into 2 filtered streams.
        </div>
    </>
);
(ProcessorNode as any).nodeType = 'processor';

export const CombinerNode = () => (
    <>
        <div className="sci-flow-node-header" style={{ backgroundColor: '#6366f1' }}>
            Combiner
        </div>
        <div className="sci-flow-node-body">
            Combines 2 signals into 1.
        </div>
    </>
);
(CombinerNode as any).nodeType = 'combiner';

export const ViewerNode = () => (
    <>
        <div className="sci-flow-node-header" style={{ backgroundColor: 'var(--sf-node-header-output)' }}>
            Viewer
        </div>
        <div className="sci-flow-node-body">
            Visualizes input data.
            <div style={{ width: '100%', height: 40, background: '#000', marginTop: 8, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '80%', height: 2, background: '#444' }}></div>
            </div>
        </div>
    </>
);
(ViewerNode as any).nodeType = 'viewer';

export const MultiNode = () => (
    <>
        <div className="sci-flow-node-header" style={{ backgroundColor: '#8b5cf6' }}>
            Complex Multi
        </div>
        <div className="sci-flow-node-body">
            3 Inputs / 3 Outputs
        </div>
    </>
);
(MultiNode as any).nodeType = 'multi';
