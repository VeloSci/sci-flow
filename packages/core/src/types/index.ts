export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Position, Size { }

export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

export type DataType = 'boolean' | 'number' | 'string' | 'object' | 'any';

export type JsonValue = string | number | boolean | null | JsonArray | JsonMap;
export type JsonArray = JsonValue[];
export interface JsonMap { [key: string]: JsonValue; }

// --- Theming System ---
// ... (Theme interface remains the same)
export interface Theme {
  name?: string;
  colors: {
    background: string;
    gridDot: string;
    nodeBackground: string;
    nodeBorder: string;
    nodeText: string;
    nodeHeaderText: string;
    nodeHeaderOps: string;
    nodeHeaderInput: string;
    nodeHeaderOutput: string;
    nodeSelected: string;
    edgeLine: string;
    edgeActive: string;
    edgeAnimated: string;
    portBackground: string;
    portBorder: string;
    portActive: string;
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
  value: JsonValue;
  options?: JsonMap; // Configuration for the widget
}

export interface Port {
  id: string;
  type: 'input' | 'output';
  dataType: DataType;
  label?: string;
  connectedEdges?: string[]; // Edge IDs connected to this port
  defaultValue?: JsonValue; // Value to use if no edge is connected
  selected?: boolean;
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
  portConfig?: 'left-right' | 'top-bottom' | 'top-in-bottom-out' | 'bottom-in-top-out' | 'left-in-right-out' | 'right-in-left-out' | 'left-top-in-bottom-right-out' | 'bottom-right-in-left-top-out' | 'bottom-top';

  // Custom interactive widgets (Blender-like controls)
  widgets?: Record<string, NodeWidget>;

  // Internal data/state managed by the node
  data: JsonMap;

  // Sandboxed logic to execute
  logicCode?: string;

  style?: NodeStyle;
  selected?: boolean;
  parentId?: string; // ID of the parent node for Subgraphs

  // --- New Features ---
  shape?: 'rectangle' | 'circle' | 'diamond' | 'hexagon' | 'ellipse' | 'parallelogram';
  resizable?: boolean;
  collapsed?: boolean;
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
    animationType?:
    // Phase 1 — Dash/CSS animations
    | 'draw' | 'draw-reverse' | 'march' | 'march-reverse'
    | 'draw-erase' | 'fade' | 'thick-pulse' | 'color-pulse'
    | 'dots-flow' | 'comet' | 'glow' | 'wipe'
    | 'scale-center' | 'scale-start'
    | 'wavy-draw' | 'zigzag-draw' | 'fusion'
    // Phase 2 — Object-based traveling animations
    | 'data-packet' | 'ping-pong' | 'swarm'
    | 'arrow-travel' | 'arrow-flow' | 'draw-arrow'
    | 'arrow-bounce' | 'direction-pulse'
    | 'spin-square' | 'morph-slide' | 'sine-orbit'
    | 'spin-x' | 'radar'
    // Legacy aliases (backward compat)
    | 'pulse' | 'arrows' | 'symbols' | 'dash' | 'dotted' | 'beam';
    animationColor?: string;
    animationDuration?: string;   // e.g. '2s', '500ms'
    animationEasing?: string;     // e.g. 'linear', 'ease-in-out', 'cubic-bezier(...)'
  };
  data?: JsonMap;
}

export interface SmartGuide {
  x?: number;
  y?: number;
}

export interface FlowState {
  nodes: Map<string, Node>;
  edges: Map<string, Edge>;
  viewport: ViewportState;
  direction: 'horizontal' | 'vertical';
  draftEdge?: { sourceNodeId: string; sourcePortId: string; targetPosition: Position };
  highlightedConnection?: {
    nodeId: string;
    portId: string;
    type: 'input' | 'output';
  };
  smartGuides?: SmartGuide[];
  defaultEdgeType?: 'straight' | 'bezier' | 'step' | 'smart';
  defaultEdgeStyle?: Edge['style'];
}

export interface Connection {
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export type OnNodesChange = (nodes: Node[]) => void;
export type OnEdgesChange = (edges: Edge[]) => void;

export type OnNodeContextMenu = (event: MouseEvent, node: Node) => void;
export type OnEdgeContextMenu = (event: MouseEvent, edge: Edge) => void;
export type OnPaneContextMenu = (event: MouseEvent) => void;
