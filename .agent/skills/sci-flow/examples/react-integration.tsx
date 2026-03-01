import { SciFlow, Background, BackgroundVariant, useNodesState, useEdgesState } from '@sci-flow/react';
import '@sci-flow/core/styles.css';

const initialNodes = [{ id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } }];
const initialEdges = [{ id: 'e1', source: '1', target: '2' }];

export function FlowApp() {
  // Use framework-specific hooks to manage selection and dragging controlled by the core
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <SciFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </SciFlow>
    </div>
  );
}
