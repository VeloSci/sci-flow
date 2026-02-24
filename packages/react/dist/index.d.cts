import { Node, SciFlow as SciFlow$1, SciFlowOptions, Edge } from '@sci-flow/core';
import React from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

/** Shape of an accepted React node component passed via nodeTypes */
interface ReactNodeComponent {
    nodeType?: string;
    type?: string;
    name?: string;
    (props: {
        node: Node;
        engine: SciFlow$1 | null;
    }): React.ReactNode;
    displayName?: string;
}
interface UseSciFlowProps extends Omit<SciFlowOptions, 'container' | 'nodeTypes'> {
    initialNodes?: Node[];
    initialEdges?: Edge[];
    /** React components to use as custom node renderers */
    nodeTypes?: ReactNodeComponent[];
    onNodeContextMenu?: (event: MouseEvent, node: Node) => void;
    onEdgeContextMenu?: (event: MouseEvent, edge: Edge) => void;
    onPaneContextMenu?: (event: MouseEvent) => void;
    onInit?: (engine: SciFlow$1) => void;
}
declare function useSciFlow({ initialNodes, initialEdges, renderer, onInit, nodeTypes, ...options }?: UseSciFlowProps): {
    containerRef: React.RefObject<HTMLDivElement | null>;
    engine: SciFlow$1 | null;
    nodes: Node[];
    edges: Edge[];
    portalMounts: Map<string, HTMLElement>;
    nodeTypes: ReactNodeComponent[];
    setNodes: (n: Node[]) => void;
    setEdges: (e: Edge[]) => void;
    fitView: (padding?: number) => void | undefined;
    centerNode: (id: string) => void | undefined;
};

interface SciFlowProps extends UseSciFlowProps {
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}
declare function SciFlow({ className, style, children, nodeTypes, ...useSciFlowProps }: SciFlowProps): react_jsx_runtime.JSX.Element;

interface SciFlowMiniMapProps {
    engine: SciFlow$1 | null;
    className?: string;
    style?: React.CSSProperties;
    width?: number;
    height?: number;
    nodeColor?: string;
    viewportColor?: string;
    backgroundColor?: string;
}
declare function SciFlowMiniMap({ engine, className, style, width, height, nodeColor, viewportColor, backgroundColor }: SciFlowMiniMapProps): react_jsx_runtime.JSX.Element;

export { type ReactNodeComponent, SciFlow, SciFlowMiniMap, type SciFlowMiniMapProps, type SciFlowProps, type UseSciFlowProps, useSciFlow };
