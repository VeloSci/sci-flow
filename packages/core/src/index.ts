export {
  type Node,
  type Edge,
  type FlowState,
  type Theme,
  type Position,
  type Size,
  type Rect,
  type ViewportState,
  type DataType,
  type JsonValue,
  type JsonMap,
  type JsonArray,
  type Connection,
  type Port
} from './types';
export * from './theme/defaultThemes';
export { StateManager } from './state/StateManager';
export { HistoryManager, type HistoryAction } from './state/HistoryManager';
export { type NodeDefinition } from './state/RegistryManager';
export * from './engine/SciFlow';
export * from './plugins/Minimap';
export * from './renderers/BaseRenderer';
export * from './renderers/SVGRenderer';
export * from './renderers/CanvasRenderer';
export * from './renderers/EdgeAnimations';

// --- Interaction Managers ---
export { TouchManager } from './interaction/TouchManager';
export { NodeResizerManager, type ResizeOptions, type ResizeDirection } from './interaction/NodeResizerManager';
export { NodeToolbarManager, type ToolbarAction } from './interaction/NodeToolbarManager';
export { EdgeLabelManager } from './interaction/EdgeLabelManager';
export { DropManager, type DropNodeData } from './interaction/DropManager';
export { LassoManager } from './interaction/LassoManager';
export { CollisionManager, type CollisionMode } from './interaction/CollisionManager';
export { SnapManager, type SnapOptions } from './interaction/SnapManager';
export { GroupManager, type NodeGroup } from './interaction/GroupManager';
export { EdgeReconnectManager, type ReconnectSide } from './interaction/EdgeReconnectManager';
export { ShortcutCustomizer, type ShortcutAction, type ShortcutBinding } from './interaction/ShortcutCustomizer';
export { HelperLinesManager, type HelperLine } from './interaction/HelperLinesManager';
export { EdgeAnnotationManager, type EdgeAnnotation } from './interaction/EdgeAnnotationManager';

// --- Plugin Managers ---
export { PluginHost, type PluginHostOptions } from './plugins/PluginHost';
export { LODManager, type LODLevel, type LODThresholds } from './plugins/LODManager';
export { AnimationManager, easings, type EasingFn } from './plugins/AnimationManager';
export { ExportManager } from './plugins/ExportManager';
export { CollapseManager } from './plugins/CollapseManager';
export { EvaluationManager } from './plugins/EvaluationManager';
export { LayoutManager, type LayoutAlgorithm, type LayoutOptions } from './plugins/LayoutManager';
export { SearchManager, type SearchResult } from './plugins/SearchManager';
export { ZoomToSelectionManager } from './plugins/ZoomToSelectionManager';
export { SnapshotManager, type Snapshot } from './plugins/SnapshotManager';
export { CollabManager, type CRDTOperation, type UserPresence } from './plugins/CollabManager';
export { PerfMonitor } from './plugins/PerfMonitor';
export { A11yManager } from './plugins/A11yManager';
export { EdgeBundler, type EdgeBundle } from './plugins/EdgeBundler';
export { StickyNoteManager, type StickyNote } from './plugins/StickyNoteManager';
export { PluginAPI, type SciFlowPlugin } from './plugins/PluginAPI';
export { HistoryPersistence, type PersistenceOptions } from './plugins/HistoryPersistence';

// --- Utilities ---
export * from './utils/validators';
export * from './utils/shapes';
export * from './utils/floatingEdges';

// Static mount helper for Vanilla JS
import { SciFlow, type SciFlowOptions } from './engine/SciFlow';
export const mount = (options: SciFlowOptions) => new SciFlow(options);
