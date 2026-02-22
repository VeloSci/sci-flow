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
    type?: string;
    animated?: boolean;
    selected?: boolean;
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
}
type OnNodesChange = (nodes: Node[]) => void;
type OnEdgesChange = (edges: Edge[]) => void;
type OnNodeContextMenu = (event: MouseEvent, node: Node) => void;
type OnEdgeContextMenu = (event: MouseEvent, edge: Edge) => void;
type OnPaneContextMenu = (event: MouseEvent) => void;

declare const lightTheme: Theme;
declare const darkTheme: Theme;

type Listener = (state: FlowState) => void;
interface NodeDefinition {
    type: string;
    renderHTML?: (node: Node) => HTMLElement;
    renderCanvas?: (ctx: CanvasRenderingContext2D, node: Node) => void;
    defaultStyle?: Partial<Node['style']>;
    evaluate?: (inputs: Record<string, any>, nodeData: any) => Record<string, any>;
}
declare class StateManager {
    private state;
    private listeners;
    readonly id: string;
    private history;
    private historyIndex;
    private maxHistory;
    private isRestoringHistory;
    private nodeRegistry;
    onNodesChange?: (nodes: Node[]) => void;
    onEdgesChange?: (edges: Edge[]) => void;
    onNodeContextMenu?: (event: MouseEvent, node: Node) => void;
    onEdgeContextMenu?: (event: MouseEvent, edge: Edge) => void;
    onPaneContextMenu?: (event: MouseEvent) => void;
    onConnect?: (connection: {
        source: string;
        sourceHandle: string;
        target: string;
        targetHandle: string;
    }) => void;
    onNodeMount?: (nodeId: string, container: HTMLElement) => void;
    onNodeUnmount?: (nodeId: string) => void;
    constructor(initialState?: Partial<FlowState>);
    registerNodeType(definition: NodeDefinition): void;
    getNodeDefinition(type: string): NodeDefinition | undefined;
    getRegisteredNodeTypes(): string[];
    getState(): FlowState;
    subscribe(listener: Listener): () => void;
    private notify;
    forceUpdate(): void;
    setNodes(nodes: Node[]): void;
    setSelection(nodeIds: string[], edgeIds: string[]): void;
    appendSelection(nodeId?: string, edgeId?: string): void;
    addNode(node: Node): void;
    setDraftEdge(sourceNodeId: string, sourcePortId: string, targetPosition: Position): void;
    clearDraftEdge(): void;
    setSmartGuides(guides: {
        x?: number;
        y?: number;
    }[]): void;
    clearSmartGuides(): void;
    saveSnapshot(): void;
    undo(): void;
    redo(): void;
    private restoreSnapshot;
    removeNode(id: string): void;
    private getDescendants;
    updateNodePosition(id: string, x: number, y: number, silent?: boolean): void;
    commitNodePositions(): void;
    setEdges(edges: Edge[]): void;
    addEdge(edge: Edge): void;
    removeEdge(id: string): void;
    setViewport(viewport: ViewportState): void;
    toJSON(): string;
    fromJSON(jsonString: string): void;
}

interface SciFlowOptions {
    container: HTMLElement;
    renderer?: 'svg' | 'canvas' | 'auto';
    autoSwitchThreshold?: number;
    theme?: Partial<Theme> | 'light' | 'dark' | 'system';
    minZoom?: number;
    maxZoom?: number;
}
declare class SciFlow {
    private container;
    private stateManager;
    private interactionManager;
    private renderer;
    private gridRenderer;
    private options;
    private unsubscribe;
    private currentTheme;
    private styleInjector?;
    constructor(options: SciFlowOptions);
    private createRenderer;
    private checkRendererThreshold;
    private switchRenderer;
    private setupTheming;
    setTheme(themeOpt?: Partial<Theme> | 'light' | 'dark' | 'system'): void;
    private applyThemeVariables;
    setNodes(nodes: Node[]): void;
    setEdges(edges: Edge[]): void;
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
    private routerWorker;
    private pendingRoutes;
    private routerIdCounter;
    private routeCache;
    private routingHashCache;
    constructor(options: RendererOptions);
    render(state: FlowState, registry: Map<string, any>): void;
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
