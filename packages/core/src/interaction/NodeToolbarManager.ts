import { StateManager } from '../state/StateManager';

export interface ToolbarAction {
    id: string;
    label: string;
    icon?: string;
    onClick: (nodeId: string) => void;
}

/** Manages floating toolbars that appear near selected nodes. */
export class NodeToolbarManager {
    private toolbarEl: HTMLDivElement | null = null;
    private actions: ToolbarAction[] = [];
    private currentNodeId: string | null = null;

    constructor(
        private container: HTMLElement,
        private stateManager: StateManager
    ) {}

    public setActions(actions: ToolbarAction[]) {
        this.actions = actions;
    }

    public show(nodeId: string) {
        this.hide();
        const node = this.stateManager.getState().nodes.get(nodeId);
        if (!node || this.actions.length === 0) return;

        this.currentNodeId = nodeId;
        const { viewport } = this.stateManager.getState();

        const screenX = node.position.x * viewport.zoom + viewport.x;
        const screenY = node.position.y * viewport.zoom + viewport.y;
        const nw = (node.style?.width || 200) * viewport.zoom;

        this.toolbarEl = document.createElement('div');
        this.toolbarEl.className = 'sci-flow-node-toolbar';
        this.toolbarEl.style.cssText = `
            position:absolute; top:${screenY - 40}px; left:${screenX}px;
            width:${nw}px; display:flex; gap:4px; justify-content:center;
            z-index:1000; pointer-events:auto;
        `;

        this.actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = 'sci-flow-toolbar-btn';
            btn.textContent = action.icon || action.label;
            btn.title = action.label;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.currentNodeId) action.onClick(this.currentNodeId);
            });
            this.toolbarEl!.appendChild(btn);
        });

        this.container.appendChild(this.toolbarEl);
    }

    public hide() {
        if (this.toolbarEl) {
            this.toolbarEl.remove();
            this.toolbarEl = null;
        }
        this.currentNodeId = null;
    }

    public updatePosition() {
        if (!this.currentNodeId || !this.toolbarEl) return;
        const node = this.stateManager.getState().nodes.get(this.currentNodeId);
        if (!node) { this.hide(); return; }

        const { viewport } = this.stateManager.getState();
        const screenX = node.position.x * viewport.zoom + viewport.x;
        const screenY = node.position.y * viewport.zoom + viewport.y;
        const nw = (node.style?.width || 200) * viewport.zoom;

        this.toolbarEl.style.top = `${screenY - 40}px`;
        this.toolbarEl.style.left = `${screenX}px`;
        this.toolbarEl.style.width = `${nw}px`;
    }

    public destroy() { this.hide(); }
}
