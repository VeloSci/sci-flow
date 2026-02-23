interface Position {
    x: number;
    y: number;
}
interface Size {
    width: number;
    height: number;
}
interface Rect extends Position, Size {
}
interface ViewportState {
    x: number;
    y: number;
    zoom: number;
}
type DataType = 'boolean' | 'number' | 'string' | 'object' | 'any';
interface Theme {
    name?: string;
    colors: {
        background: string;
        gridDot: string;
        nodeBackground: string;
        nodeBorder: string;
        nodeText: string;
        edgeLine: string;
        edgeActive: string;
        edgeAnimated: string;
        portBackground: string;
        portBorder: string;
        contextMenuBackground: string;
        contextMenuText: string;
        contextMenuHover: string;
        selectionBoxBackground: string;
        selectionBoxBorder: string;
    };
}
type ThemeMode = 'light' | 'dark' | 'system';
interface NodeWidget {
    id: string;
    type: string;
    value: any;
    options?: Record<string, any>;
}
interface Port {
    id: string;
    type: 'input' | 'output';
    dataType: DataType;
    label?: string;
    connectedEdges?: string[];
    defaultValue?: any;
}
interface NodeStyle {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: number;
    layout?: 'flex-col' | 'flex-row' | 'grid' | 'absolute';
}
interface Node {
    id: string;
    type: string;
    position: Position;
    inputs: Record<string, Port>;
    outputs: Record<string, Port>;
    portConfig?: 'left-right' | 'top-bottom' | 'top-in-bottom-out' | 'bottom-in-top-out' | 'left-in-right-out' | 'right-in-left-out' | 'left-top-in-bottom-right-out' | 'bottom-right-in-left-top-out';
    widgets?: Record<string, NodeWidget>;
    data: Record<string, any>;
    logicCode?: string;
    style?: NodeStyle;
    selected?: boolean;
    parentId?: string;
}
interface Edge {
    id: string;
    source: string;
    sourceHandle: string;
    target: string;
    targetHandle: string;
    type?: 'straight' | 'bezier' | 'step' | 'smart';
    animated?: boolean;
    selected?: boolean;
    style?: {
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        stroke?: string;
        strokeWidth?: number;
        animationType?: 'pulse' | 'arrows' | 'symbols' | 'dash';
    };
    data?: Record<string, any>;
}
interface FlowState {
    nodes: Map<string, Node>;
    edges: Map<string, Edge>;
    viewport: ViewportState;
    draftEdge?: {
        sourceNodeId: string;
        sourcePortId: string;
        targetPosition: Position;
    };
    smartGuides?: {
        x?: number;
        y?: number;
    }[];
    defaultEdgeType?: 'straight' | 'bezier' | 'step' | 'smart';
    defaultEdgeStyle?: {
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        stroke?: string;
        strokeWidth?: number;
        animationType?: 'pulse' | 'arrows' | 'symbols' | 'dash';
    };
}
type OnNodesChange = (nodes: Node[]) => void;
type OnEdgesChange = (edges: Edge[]) => void;
type OnNodeContextMenu = (event: MouseEvent, node: Node) => void;
type OnEdgeContextMenu = (event: MouseEvent, edge: Edge) => void;
type OnPaneContextMenu = (event: MouseEvent) => void;

declare const lightTheme: Theme;
declare const darkTheme: Theme;

interface NodeDefinition {
    type: string;
    renderHTML?: (node: Node) => HTMLElement;
    renderCanvas?: (ctx: CanvasRenderingContext2D, node: Node) => void;
    defaultStyle?: Partial<Node['style']>;
    evaluate?: (inputs: Record<string, any>, nodeData: any) => Record<string, any>;
}

type Listener = (state: FlowState) => void;
declare class StateManager {
    private state;
    private listeners;
    readonly id: string;
    private history;
    private registry;
    onNodesChange?: (nodes: Node[]) => void;
    onEdgesChange?: (edges: Edge[]) => void;
    onConnect?: (connection: any) => void;
    onNodeMount?: (nodeId: string, container: HTMLElement) => void;
    onNodeUnmount?: (nodeId: string) => void;
    constructor(initialState?: Partial<FlowState>);
    registerNodeType(def: NodeDefinition): void;
    getNodeDefinition(type: string): NodeDefinition | undefined;
    getRegisteredNodeTypes(): string[];
    getNodeRegistry(): Map<string, NodeDefinition>;
    getState(): FlowState;
    subscribe(l: Listener): () => boolean;
    private notify;
    forceUpdate(): void;
    setNodes(nodes: Node[]): void;
    setEdges(edges: Edge[]): void;
    setSelection(nodeIds: string[], edgeIds: string[]): void;
    addNode(node: Node): void;
    setDraftEdge(sourceNodeId: string, sourcePortId: string, targetPosition: Position): void;
    clearDraftEdge(): void;
    removeNode(id: string): void;
    private getDescendantsLocal;
    updateNodePosition(id: string, x: number, y: number, silent?: boolean): void;
    addEdge(edge: Edge): void;
    removeEdge(id: string): void;
    saveSnapshot(): void;
    undo(): void;
    redo(): void;
    private restoreSnapshot;
    setDefaultEdgeType(type: 'straight' | 'bezier' | 'step' | 'smart'): void;
    setDefaultEdgeStyle(style: any): void;
    toJSON(): string;
    fromJSON(jsonString: string): void;
    setViewport(v: ViewportState): void;
    setSmartGuides(guides: {
        x?: number;
        y?: number;
    }[]): void;
    clearSmartGuides(): void;
    commitNodePositions(): void;
}

interface SciFlowOptions {
    container: HTMLElement;
    renderer?: 'svg' | 'canvas' | 'auto';
    autoSwitchThreshold?: number;
    theme?: Partial<Theme> | 'light' | 'dark' | 'system';
    minZoom?: number;
    maxZoom?: number;
    nodeTypes?: any[];
}
declare class SciFlow {
    private container;
    private stateManager;
    private interactionManager;
    private renderer;
    private gridRenderer;
    private options;
    private unsubscribe;
    private themeManager;
    constructor(options: SciFlowOptions);
    private createRenderer;
    private checkRendererThreshold;
    private switchRenderer;
    setTheme(themeOpt?: Partial<Theme> | 'light' | 'dark' | 'system'): void;
    setNodes(nodes: Node[]): void;
    setEdges(edges: Edge[]): void;
    addNode(node: Node): void;
    removeNode(id: string): void;
    addEdge(edge: Edge): void;
    removeEdge(id: string): void;
    getState(): FlowState;
    forceUpdate(): void;
    setDefaultEdgeType(type: 'straight' | 'bezier' | 'step' | 'smart'): void;
    setDefaultEdgeStyle(style: any): void;
    subscribe(listener: (state: FlowState) => void): () => void;
    updateNodePosition(id: string, x: number, y: number): void;
    fitView(padding?: number): void;
    centerNode(id: string): void;
    toJSON(): string;
    fromJSON(jsonString: string): void;
    destroy(): void;
}

interface MinimapOptions {
    container: HTMLElement;
    stateManager: StateManager;
    width?: number;
    height?: number;
    nodeColor?: string;
    viewportColor?: string;
    backgroundColor?: string;
}
declare class Minimap {
    private canvas;
    private ctx;
    private stateManager;
    private options;
    private isDragging;
    private unsubscribe;
    constructor(options: MinimapOptions);
    private bindEvents;
    private unbindEvents;
    private onPointerDown;
    private onPointerMove;
    private onPointerUp;
    private panToEvent;
    private getWorldBounds;
    private render;
    destroy(): void;
}

interface RendererOptions {
    container: HTMLElement;
}
declare abstract class BaseRenderer {
    protected container: HTMLElement;
    constructor(options: RendererOptions);
    abstract render(state: FlowState, registry: Map<string, any>): void;
    abstract destroy(): void;
    abstract getViewportElement(): HTMLElement | SVGElement;
}

declare class SVGRenderer extends BaseRenderer {
    private svg;
    private nodesGroup;
    private edgesGroup;
    private styleEl;
    private routerWorker;
    private pendingRoutes;
    routerIdCounter: number;
    private routeCache;
    private routingHashCache;
    private nodeManager;
    private edgeManager;
    constructor(options: RendererOptions);
    render(state: FlowState, registry: Map<string, any>): void;
    private renderDraftEdge;
    private getPortAnchor;
    getViewportElement(): SVGElement;
    destroy(): void;
}

declare class CanvasRenderer extends BaseRenderer {
    private canvas;
    private ctx;
    private animationFrameId;
    private state;
    private registry;
    constructor(options: RendererOptions);
    private resize;
    render(state: FlowState, registry: Map<string, any>): void;
    private draw;
    getViewportElement(): HTMLElement;
    destroy(): void;
}

export { BaseRenderer, CanvasRenderer, type DataType, type Edge, type FlowState, Minimap, type MinimapOptions, type Node, type NodeDefinition, type NodeStyle, type NodeWidget, type OnEdgeContextMenu, type OnEdgesChange, type OnNodeContextMenu, type OnNodesChange, type OnPaneContextMenu, type Port, type Position, type Rect, type RendererOptions, SVGRenderer, SciFlow, type SciFlowOptions, type Size, StateManager, type Theme, type ThemeMode, type ViewportState, darkTheme, lightTheme };
