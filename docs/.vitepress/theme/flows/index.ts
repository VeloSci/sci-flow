export const sampleFlowData = {
    nodes: [
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
    ],
    edges: [
        { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'out1', targetHandle: 'in1', animated: true, type: 'smart' },
        { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'high', targetHandle: 'in1', type: 'bezier' }
    ]
};
