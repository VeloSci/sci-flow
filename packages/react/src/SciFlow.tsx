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
    
    const { containerRef, portalMounts, nodes } = useSciFlow(useSciFlowProps);

    // Render registered node Types dynamically mapping Node data to React components
    // We need a dictionary of React components to render.
    const typeMap = useMemo(() => {
        const map = new Map<string, React.FC<any>>();
        nodeTypes.forEach(Comp => {
            // Assume the Component defines a static `nodeType` string property 
            const typeName = (Comp as any).nodeType || Comp.name;
            map.set(typeName, Comp);
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
                
                // Safe guard if node was deleted but portal mount is still unmounting
                // Or if domElement from vanilla core is invalid
                if (!nodeData || !domElement) {
                    console.warn(`SciFlow React wrapper: Missing or invalid portal target for node ${nodeId}`, { nodeData, domElement });
                    return null; 
                }
                
                const NodeComponent = typeMap.get(nodeData.type);
                
                // If a React Component is registered for this node type, render it via Portal
                if (NodeComponent) {
                    return createPortal(<NodeComponent key={nodeId} node={nodeData} />, domElement as Element);
                }

                // Fallback UI inside React namespace if type is unmapped but exists in state
                return createPortal(
                    <div key={nodeId} style={{ background: '#333', color: 'white', padding: '10px', borderRadius: '6px', width: '100%', height: '100%' }}>
                        <strong>{nodeData.type}</strong><br/>
                        <small>{nodeId}</small>
                    </div>, 
                    domElement as Element
                );
            })}

            {/* Optional minimap, context menus, or overlays user passes as children */}
            {children}
        </div>
    );
};
