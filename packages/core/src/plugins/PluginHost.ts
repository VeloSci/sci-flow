import { StateManager } from '../state/StateManager';
import { HistoryManager } from '../state/HistoryManager';
import { TouchManager } from '../interaction/TouchManager';
import { NodeResizerManager } from '../interaction/NodeResizerManager';
import { NodeToolbarManager } from '../interaction/NodeToolbarManager';
import { EdgeLabelManager } from '../interaction/EdgeLabelManager';
import { DropManager } from '../interaction/DropManager';
import { LassoManager } from '../interaction/LassoManager';
import { CollisionManager } from '../interaction/CollisionManager';
import { SnapManager } from '../interaction/SnapManager';
import { GroupManager } from '../interaction/GroupManager';
import { EdgeReconnectManager } from '../interaction/EdgeReconnectManager';
import { ShortcutCustomizer } from '../interaction/ShortcutCustomizer';
import { HelperLinesManager } from '../interaction/HelperLinesManager';
import { EdgeAnnotationManager } from '../interaction/EdgeAnnotationManager';
import { LODManager } from './LODManager';
import { AnimationManager } from './AnimationManager';
import { ExportManager } from './ExportManager';
import { CollapseManager } from './CollapseManager';
import { EvaluationManager } from './EvaluationManager';
import { LayoutManager } from './LayoutManager';
import { SearchManager } from './SearchManager';
import { ZoomToSelectionManager } from './ZoomToSelectionManager';
import { SnapshotManager } from './SnapshotManager';
import { CollabManager } from './CollabManager';
import { PerfMonitor } from './PerfMonitor';
import { A11yManager } from './A11yManager';
import { EdgeBundler } from './EdgeBundler';
import { StickyNoteManager } from './StickyNoteManager';
import { PluginAPI } from './PluginAPI';
import { HistoryPersistence } from './HistoryPersistence';
import type { CollisionMode } from '../interaction/CollisionManager';
import type { ResizeOptions } from '../interaction/NodeResizerManager';
import type { SnapOptions } from '../interaction/SnapManager';

export interface PluginHostOptions {
    collisionMode?: CollisionMode;
    resizeOptions?: ResizeOptions;
    snapOptions?: Partial<SnapOptions>;
}

/** Aggregates all plugin managers for the SciFlow engine. */
export class PluginHost {
    // Interaction managers
    public readonly touch: TouchManager;
    public readonly resizer: NodeResizerManager;
    public readonly toolbar: NodeToolbarManager;
    public readonly edgeLabels: EdgeLabelManager;
    public readonly drop: DropManager;
    public readonly lasso: LassoManager;
    public readonly collision: CollisionManager;
    public readonly snap: SnapManager;
    public readonly groups: GroupManager;
    public readonly reconnect: EdgeReconnectManager;
    public readonly shortcuts: ShortcutCustomizer;
    public readonly helperLines: HelperLinesManager;
    public readonly annotations: EdgeAnnotationManager;

    // Plugin managers
    public readonly lod: LODManager;
    public readonly animation: AnimationManager;
    public readonly exporter: ExportManager;
    public readonly collapse: CollapseManager;
    public readonly evaluation: EvaluationManager;
    public readonly layout: LayoutManager;
    public readonly search: SearchManager;
    public readonly zoomToSelection: ZoomToSelectionManager;
    public readonly snapshots: SnapshotManager;
    public readonly collab: CollabManager;
    public readonly perfMonitor: PerfMonitor;
    public readonly a11y: A11yManager;
    public readonly edgeBundler: EdgeBundler;
    public readonly stickyNotes: StickyNoteManager;
    public readonly pluginAPI: PluginAPI;
    public readonly historyPersistence: HistoryPersistence;

    constructor(
        container: HTMLElement,
        stateManager: StateManager,
        historyManager: HistoryManager,
        options?: PluginHostOptions
    ) {
        // Interaction
        this.touch = new TouchManager(container, stateManager);
        this.resizer = new NodeResizerManager(stateManager, options?.resizeOptions);
        this.toolbar = new NodeToolbarManager(container, stateManager);
        this.edgeLabels = new EdgeLabelManager(container, stateManager);
        this.drop = new DropManager(container, stateManager);
        this.lasso = new LassoManager(container, stateManager);
        this.collision = new CollisionManager(stateManager, options?.collisionMode);
        this.snap = new SnapManager(stateManager, options?.snapOptions);
        this.groups = new GroupManager(stateManager);
        this.reconnect = new EdgeReconnectManager(stateManager);
        this.shortcuts = new ShortcutCustomizer();
        this.helperLines = new HelperLinesManager(stateManager);
        this.annotations = new EdgeAnnotationManager(container);

        // Plugins
        this.lod = new LODManager(container, stateManager);
        this.animation = new AnimationManager(stateManager);
        this.exporter = new ExportManager(container, stateManager);
        this.collapse = new CollapseManager(stateManager);
        this.evaluation = new EvaluationManager(stateManager);
        this.layout = new LayoutManager(stateManager);
        this.search = new SearchManager(stateManager);
        this.zoomToSelection = new ZoomToSelectionManager(stateManager, container);
        this.snapshots = new SnapshotManager(stateManager);
        this.collab = new CollabManager();
        this.perfMonitor = new PerfMonitor(container);
        this.a11y = new A11yManager(container);
        this.edgeBundler = new EdgeBundler(stateManager);
        this.stickyNotes = new StickyNoteManager(container, stateManager);
        this.pluginAPI = new PluginAPI();
        this.historyPersistence = new HistoryPersistence(historyManager);
    }

    /** Call on every state change. */
    public onStateChange() {
        this.lod.update();
        this.edgeLabels.reconcile();
        this.toolbar.updatePosition();
        this.stickyNotes.reconcile();
        this.annotations.reconcile(
            this.lod['stateManager']?.getState?.()?.viewport || { x: 0, y: 0, zoom: 1 }
        );
        this.pluginAPI.notifyStateChange();
    }

    public destroy() {
        this.toolbar.destroy();
        this.edgeLabels.destroy();
        this.drop.destroy();
        this.annotations.destroy();
        this.perfMonitor.destroy();
        this.pluginAPI.destroyAll();
    }
}
