import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@sci-flow/react';

// Custom edge implementing a bi-directional data flow visual
export function BiDirectionalEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: '#ff0072',
            padding: 10,
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 700,
            color: 'white',
            pointerEvents: 'all', // Allows clicking the label inside the overlay
          }}
          className="nodrag nopan"
        >
          {data?.label || 'Flow'}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
