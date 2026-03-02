import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSciFlow, type UseSciFlowProps, type ReactNodeComponent } from './useSciFlow';
import type { SciFlow as SciFlowEngine } from '@sci-flow/core';

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
    const { containerRef, portalMounts, nodes, engine, highlightedConnection } = useSciFlow({ ...useSciFlowProps, nodeTypes });

    // Build a lookup map from node type string → React component
    const typeMap = useMemo(() => {
        const map = new Map<string, ReactNodeComponent>();
        nodeTypes.forEach(Comp => {
            const type = Comp.nodeType ?? Comp.type ?? Comp.name;
            if (type) {
                map.set(type, Comp);
                // Also register under lowercase-without-"node" suffix for convenience
                const shortName = type.toLowerCase().replace(/node$/, '');
                if (shortName !== type) map.set(shortName, Comp);
            }
        });
        return map;
    }, [nodeTypes]);

    return (
        <div
            ref={containerRef}
            className={`sci-flow-react-container ${className ?? ''}`}
            style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', ...style }}
        >
            {/* Portals for mounting React components into vanilla DOM node bodies */}
            {Array.from(portalMounts.entries()).map(([nodeId, domElement]) => {
                const nodeData = nodes.find(n => n.id === nodeId);
                if (!nodeData) return null;

                const NodeComponent = typeMap.get(nodeData.type);
                if (!NodeComponent) return null;

                const engineRef = engine as SciFlowEngine | null;
                return createPortal(
                    <NodeComponent key={nodeId} node={nodeData} engine={engineRef} highlightedConnection={highlightedConnection} />,
                    domElement as Element
                );
            })}

            {/* Optional overlays, minimap, context menus passed as children */}
            {children}
        </div>
    );
}
