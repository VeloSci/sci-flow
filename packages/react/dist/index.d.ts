import * as React from 'react';
import React__default from 'react';
import { SciFlowOptions, Node, Edge, SciFlow as SciFlow$1 } from '@sci-flow/core';
import * as react_jsx_runtime from 'react/jsx-runtime';

interface UseSciFlowProps extends Omit<SciFlowOptions, 'container'> {
    initialNodes?: Node[];
    initialEdges?: Edge[];
    nodeTypes?: any[];
    onNodeContextMenu?: (event: MouseEvent, node: Node) => void;
    onEdgeContextMenu?: (event: MouseEvent, edge: Edge) => void;
    onPaneContextMenu?: (event: MouseEvent) => void;
    onInit?: (engine: SciFlow$1) => void;
}
declare function useSciFlow({ initialNodes, initialEdges, renderer, onInit, ...options }?: UseSciFlowProps): {
    containerRef: React.RefObject<HTMLDivElement | null>;
    engine: SciFlow$1 | null;
    nodes: Node[];
    edges: Edge[];
    portalMounts: Map<string, HTMLElement>;
    setNodes: (n: Node[]) => void;
    setEdges: (e: Edge[]) => void;
    fitView: (padding?: number) => void | undefined;
    centerNode: (id: string) => void | undefined;
};

interface SciFlowProps extends UseSciFlowProps {
    className?: string;
    style?: React__default.CSSProperties;
    children?: React__default.ReactNode;
}
declare function SciFlow({ className, style, children, nodeTypes, ...useSciFlowProps }: SciFlowProps): react_jsx_runtime.JSX.Element;

interface SciFlowMiniMapProps {
    engine: SciFlow$1 | null;
    className?: string;
    style?: React__default.CSSProperties;
    width?: number;
    height?: number;
    nodeColor?: string;
    viewportColor?: string;
    backgroundColor?: string;
}
declare function SciFlowMiniMap({ engine, className, style, width, height, nodeColor, viewportColor, backgroundColor }: SciFlowMiniMapProps): react_jsx_runtime.JSX.Element;

export { SciFlow, SciFlowMiniMap, type SciFlowMiniMapProps, type SciFlowProps, type UseSciFlowProps, useSciFlow };
