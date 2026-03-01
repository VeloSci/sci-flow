import { StateManager } from '../state/StateManager';
import { Position, ViewportState } from '../types';
import { PanZoomManager } from './PanZoomManager';
import { SelectionManager } from './SelectionManager';
import { ConnectionManager } from './ConnectionManager';
import { DragManager } from './DragManager';
import { ShortcutManager } from './ShortcutManager';

export interface InteractionOptions {
    container: HTMLElement;
    stateManager: StateManager;
    minZoom?: number;
    maxZoom?: number;
    snapToGrid?: boolean;
    gridSize?: number;
    showSmartGuides?: boolean;
    plugins?: import('../plugins/PluginHost').PluginHost;
}

export class InteractionManager {
    private container: HTMLElement;
    private stateManager: StateManager;

    private panZoom: PanZoomManager;
    private selection: SelectionManager;
    private connection: ConnectionManager;
    private drag: DragManager;
    private shortcuts: ShortcutManager;

    private isPanning = false;
    private lastPointerPos: Position = { x: 0, y: 0 };
    private isSpacePressed = false;
    private cleanupEvents: Array<() => void> = [];

    constructor({ container, stateManager, snapToGrid = true, gridSize = 20, showSmartGuides = true, plugins }: InteractionOptions) {
        this.container = container;
        this.stateManager = stateManager;

        this.panZoom = new PanZoomManager(stateManager);
        this.selection = new SelectionManager(container, stateManager);
        this.connection = new ConnectionManager(container, stateManager);
        this.drag = new DragManager(container, stateManager, plugins, { snapToGrid, gridSize, showSmartGuides });
        this.shortcuts = new ShortcutManager(stateManager, plugins);

        this.bindEvents();
    }

    private bindEvents() {
        this.container.style.touchAction = 'none';

        const onWheel = (e: WheelEvent) => this.panZoom.handleWheel(e);
        const onPointerDown = this.handlePointerDown.bind(this);
        const onPointerMove = this.handlePointerMove.bind(this);
        const onPointerUp = this.handlePointerUp.bind(this);
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                this.isSpacePressed = true;
                this.container.style.cursor = 'grab';
            }
            this.shortcuts.handleKeyDown(e);
        };
        const onKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                this.isSpacePressed = false;
                this.container.style.cursor = 'default';
            }
        };

        const onContextMenu = (e: MouseEvent) => e.preventDefault();

        this.container.addEventListener('wheel', onWheel, { passive: false });
        this.container.addEventListener('pointerdown', onPointerDown);
        this.container.addEventListener('contextmenu', onContextMenu);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('copy', (e) => this.shortcuts.handleCopy(e));
        window.addEventListener('paste', (e) => this.shortcuts.handlePaste(e));

        this.cleanupEvents = [
            () => this.container.removeEventListener('wheel', onWheel),
            () => this.container.removeEventListener('pointerdown', onPointerDown),
            () => this.container.removeEventListener('contextmenu', onContextMenu),
            () => window.removeEventListener('pointermove', onPointerMove),
            () => window.removeEventListener('pointerup', onPointerUp),
            () => window.removeEventListener('keydown', onKeyDown),
            () => window.removeEventListener('keyup', onKeyUp)
        ];
    }

    private handlePointerDown(e: PointerEvent) {
        const target = e.target as HTMLElement;
        const portEl = target.closest('.sci-flow-port') as HTMLElement;
        if (portEl?.dataset.nodeid && portEl?.dataset.portid) {
            this.connection.startDraft(portEl.dataset.nodeid, portEl.dataset.portid, e.pointerId);
            return;
        }

        const state = this.stateManager.getState();
        const rect = this.container.getBoundingClientRect();
        const flowPos = this.screenToFlow({ x: e.clientX, y: e.clientY }, state.viewport, rect);

        const noteEl = target.closest('.sci-flow-sticky-note') as HTMLElement;
        if (noteEl && noteEl.id) {
            this.drag.startDrag([noteEl.id], flowPos, e.pointerId);
            return;
        }

        const clickedNodeId = this.findNodeAt(flowPos);
        if (clickedNodeId) {
            const node = state.nodes.get(clickedNodeId);
            const selectedIds = node?.selected 
                ? Array.from(state.nodes.values()).filter(n => n.selected).map(n => n.id)
                : [clickedNodeId];
            
            if (!node?.selected && !e.shiftKey) {
                this.stateManager.setSelection([clickedNodeId], []);
            } else if (e.shiftKey) {
                this.stateManager.appendSelection(clickedNodeId);
            }

            this.drag.startDrag(selectedIds, flowPos, e.pointerId);
            return;
        }

        // Check if we clicked on an edge
        const edgeEl = target.closest('.sci-flow-edge-bg, .sci-flow-edge-fg');
        if (edgeEl && edgeEl.parentElement && edgeEl.parentElement.id.startsWith('edge-group-')) {
            const edgeId = edgeEl.parentElement.id.replace('edge-group-', '');
            if (e.shiftKey) {
                this.stateManager.appendSelection(undefined, edgeId);
            } else {
                this.stateManager.setSelection([], [edgeId]);
            }
            return;
        }

        if (e.button === 1 || e.button === 2 || (e.button === 0 && this.isSpacePressed)) {
            this.isPanning = true;
            this.lastPointerPos = { x: e.clientX, y: e.clientY };
            this.container.setPointerCapture(e.pointerId);
            this.container.style.cursor = 'grabbing';
            return;
        }

        if (e.button === 0 && !this.isSpacePressed) {
            if (e.shiftKey) {
                this.selection.startSelection({ x: e.clientX, y: e.clientY });
            } else {
                this.stateManager.setSelection([], []);
                this.isPanning = true;
                this.lastPointerPos = { x: e.clientX, y: e.clientY };
                this.container.setPointerCapture(e.pointerId);
                this.container.style.cursor = 'grabbing';
            }
        }
    }

    private handlePointerMove(e: PointerEvent) {
        const state = this.stateManager.getState();
        const rect = this.container.getBoundingClientRect();
        const flowPos = this.screenToFlow({ x: e.clientX, y: e.clientY }, state.viewport, rect);

        if (this.connection.isDrafting()) {
            this.connection.updateDraft(flowPos);
        } else if (this.drag.isDragging()) {
            this.drag.updateDrag(flowPos, e);
        } else if (this.isPanning) {
            this.lastPointerPos = this.panZoom.handlePan(e, this.lastPointerPos);
        } else {
            this.selection.updateSelection({ x: e.clientX, y: e.clientY }, state.viewport);
        }
    }

    private handlePointerUp(e: PointerEvent) {
        this.connection.endDraft(e);
        this.drag.endDrag(e.pointerId);
        this.selection.endSelection();
        this.isPanning = false;
        this.container.style.cursor = this.isSpacePressed ? 'grab' : 'default';
        if (this.container.hasPointerCapture(e.pointerId)) {
            this.container.releasePointerCapture(e.pointerId);
        }
    }

    private findNodeAt(pos: Position): string | null {
        const state = this.stateManager.getState();
        const nodes = Array.from(state.nodes.values()).reverse();
        for (const node of nodes) {
            const nw = node.style?.width || 200;
            const nh = node.style?.height || 150;
            if (pos.x >= node.position.x && pos.x <= node.position.x + nw &&
                pos.y >= node.position.y && pos.y <= node.position.y + nh) {
                return node.id;
            }
        }
        return null;
    }

    private screenToFlow(pos: Position, viewport: ViewportState, rect: DOMRect): Position {
        return {
            x: (pos.x - rect.left - viewport.x) / viewport.zoom,
            y: (pos.y - rect.top - viewport.y) / viewport.zoom
        };
    }

    public destroy() {
        this.cleanupEvents.forEach(c => c());
    }
}
