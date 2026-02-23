import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSciFlow, UseSciFlowProps } from './useSciFlow';

export interface SciFlowProps extends UseSciFlowProps {
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

export function SciFlow({ 
    className, 
    style, 
    children,
    nodeTypes = [],
    ...useSciFlowProps 
}: SciFlowProps) {
    
    // Convert array of React components into a nodeRegistry-compatible map
    // We expect user to pass components where `type` might be intrinsic or a static property.
    // For simplicity, we assume they pass a prop or map. 
    // Wait, the core SciFlow expects `renderHTML` for custom UI.
    // We already bypass `renderHTML` entirely when building React wrappers because 
    // we use `portalMounts` instead! The Core will just render an empty `<foreignObject>` Wrapper.
    
    const { containerRef, portalMounts, nodes, engine } = useSciFlow({ ...useSciFlowProps, nodeTypes });

    // Render registered node Types dynamically mapping Node data to React components
    // We need a dictionary of React components to render.
    const typeMap = useMemo(() => {
        const map = new Map<string, React.FC<any>>();
        nodeTypes.forEach(Comp => {
            if ((Comp as any).nodeType) {
                map.set((Comp as any).nodeType, Comp);
            }
            if (Comp.name) {
                map.set(Comp.name, Comp);
                // Normalization for common lowercase prototypes (e.g. GeneratorNode -> generator)
                map.set(Comp.name.toLowerCase().replace('node', ''), Comp);
            }
        });
        return map;
    }, [nodeTypes]);

    return (
        <div 
            ref={containerRef} 
            className={`sci-flow-react-container ${className || ''}`} 
            style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', ...style }}
        >
            {/* The canvas/SVG injected by vanilla core will live here */}
            
            {/* Portals for mounting React UI into the agnostic vanilla DOM nodes */}
            {Array.from(portalMounts.entries()).map(([nodeId, domElement]) => {
                const nodeData = nodes.find(n => n.id === nodeId);
                if (!nodeData || !domElement) return null;
                
                const NodeComponent = typeMap.get(nodeData.type);
                
                if (NodeComponent) {
                    return createPortal(<NodeComponent key={nodeId} node={nodeData} engine={engine} />, domElement as Element);
                }

                return null;
            })}

            {/* Optional minimap, context menus, or overlays user passes as children */}
            {children}
        </div>
    );
};
