import React, { memo } from 'react';
import { Handle, Position } from '@sci-flow/react';

// Custom nodes receive 'data' and state properties (like 'selected')
export const ColorSelectorNode = memo(({ data, isConnectable }) => {
  return (
    <div style={{ padding: '10px', background: '#333', color: '#fff', borderRadius: '5px' }}>
      {/* Target handle receiving connections on the top */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ background: '#555' }}
      />
      <div>
        <strong>{data.label}</strong>
      </div>
      <input 
        className="nodrag" // Prevents the chart from panning when trying to slide the input
        type="color" 
        defaultValue={data.color} 
        onChange={data.onChange} 
      />
      
      {/* Source handle emitting connections on the bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={{ top: 'auto', bottom: -5, background: '#a855f7' }}
        isConnectable={isConnectable}
      />
    </div>
  );
});
