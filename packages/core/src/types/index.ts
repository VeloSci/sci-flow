export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Position, Size {}

export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

export type DataType = 'boolean' | 'number' | 'string' | 'object' | 'any';

// --- Theming System ---
export interface Theme {
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

export type ThemeMode = 'light' | 'dark' | 'system';

// Represents an arbitrary widget (like a slider, color picker, or HTML container) inside a node
export interface NodeWidget {
  id: string;
  type: string; // e.g., 'number-input', 'color-picker', 'custom-html'
  value: any;
  options?: Record<string, any>; // Configuration for the widget
}

export interface Port {
  id: string;
  type: 'input' | 'output';
  dataType: DataType;
  label?: string;
  connectedEdges?: string[]; // Edge IDs connected to this port
  defaultValue?: any; // Value to use if no edge is connected
}

export interface NodeStyle {
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  // Allows customizing how the structural layout behaves
  layout?: 'flex-col' | 'flex-row' | 'grid' | 'absolute'; 
}

export interface Node {
  id: string;
  type: string; // Mapped to a registered custom node component
  position: Position;
  
  // Dynamic port routing
  inputs: Record<string, Port>;
  outputs: Record<string, Port>;
  portConfig?: 'left-right' | 'top-bottom' | 'top-in-bottom-out' | 'bottom-in-top-out' | 'left-in-right-out' | 'right-in-left-out' | 'left-top-in-bottom-right-out' | 'bottom-right-in-left-top-out';
  
  // Custom interactive widgets (Blender-like controls)
  widgets?: Record<string, NodeWidget>;

  // Internal data/state managed by the node
  data: Record<string, any>;
  
  // Sandboxed logic to execute
  logicCode?: string;

  style?: NodeStyle;
  selected?: boolean;
  parentId?: string; // ID of the parent node for Subgraphs
}

export interface Edge {
  id: string;
  source: string; // Node ID
  sourceHandle: string; // Port ID
  target: string; // Node ID
  targetHandle: string; // Port ID
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

export interface FlowState {
  nodes: Map<string, Node>;
  edges: Map<string, Edge>;
  viewport: ViewportState;
  draftEdge?: { sourceNodeId: string; sourcePortId: string; targetPosition: Position };
  smartGuides?: { x?: number, y?: number }[];
  defaultEdgeType?: 'straight' | 'bezier' | 'step' | 'smart';
  defaultEdgeStyle?: {
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    stroke?: string;
    strokeWidth?: number;
    animationType?: 'pulse' | 'arrows' | 'symbols' | 'dash';
  };
}

export type OnNodesChange = (nodes: Node[]) => void;
export type OnEdgesChange = (edges: Edge[]) => void;

export type OnNodeContextMenu = (event: MouseEvent, node: Node) => void;
export type OnEdgeContextMenu = (event: MouseEvent, edge: Edge) => void;
export type OnPaneContextMenu = (event: MouseEvent) => void;
