import { StateManager } from '../state/StateManager';

/** Manages expand/collapse of subtrees in the graph. */
export class CollapseManager {
    /** Map of collapsed node IDs to their hidden children edge data. */
    private collapsedNodes = new Map<string, {
        hiddenNodeIds: string[];
        hiddenEdgeIds: string[];
    }>();

    constructor(private stateManager: StateManager) {}

    /** Toggle collapse state of a node and its descendants. */
    public toggle(nodeId: string) {
        if (this.collapsedNodes.has(nodeId)) {
            this.expand(nodeId);
        } else {
            this.collapse(nodeId);
        }
    }

    /** Collapse: hide all child nodes and their edges. */
    public collapse(nodeId: string) {
        if (this.collapsedNodes.has(nodeId)) return;
        const state = this.stateManager.getState();
        const descendants = this.getDescendants(nodeId);
        if (descendants.length === 0) return;

        const hiddenEdgeIds: string[] = [];
        state.edges.forEach((edge) => {
            if (descendants.includes(edge.source) || descendants.includes(edge.target)) {
                hiddenEdgeIds.push(edge.id);
            }
        });

        // Store in collapsed map
        this.collapsedNodes.set(nodeId, {
            hiddenNodeIds: descendants,
            hiddenEdgeIds
        });

        // Mark descendants as hidden (move them offscreen)
        descendants.forEach(id => {
            const node = state.nodes.get(id);
            if (node) {
                node.data = { ...node.data, _collapsed: true, _parentCollapse: nodeId };
            }
        });

        // Mark the parent node as collapsed
        const parentNode = state.nodes.get(nodeId);
        if (parentNode) {
            parentNode.data = { ...parentNode.data, _isCollapsed: true };
        }

        this.stateManager.forceUpdate();
    }

    /** Expand: restore all previously hidden children. */
    public expand(nodeId: string) {
        const info = this.collapsedNodes.get(nodeId);
        if (!info) return;
        const state = this.stateManager.getState();

        info.hiddenNodeIds.forEach(id => {
            const node = state.nodes.get(id);
            if (node) {
                const cleaned = { ...node.data } as Record<string, unknown>;
                delete cleaned._collapsed;
                delete cleaned._parentCollapse;
                node.data = cleaned as typeof node.data;
            }
        });

        const parentNode = state.nodes.get(nodeId);
        if (parentNode) {
            const cleaned = { ...parentNode.data } as Record<string, unknown>;
            delete cleaned._isCollapsed;
            parentNode.data = cleaned as typeof parentNode.data;
        }

        this.collapsedNodes.delete(nodeId);
        this.stateManager.forceUpdate();
    }

    public isCollapsed(nodeId: string): boolean {
        return this.collapsedNodes.has(nodeId);
    }

    public isHidden(nodeId: string): boolean {
        for (const info of this.collapsedNodes.values()) {
            if (info.hiddenNodeIds.includes(nodeId)) return true;
        }
        return false;
    }

    private getDescendants(parentId: string): string[] {
        const state = this.stateManager.getState();
        const result: string[] = [];
        const queue = [parentId];
        while (queue.length > 0) {
            const current = queue.shift()!;
            state.nodes.forEach((node) => {
                if (node.parentId === current && !result.includes(node.id)) {
                    result.push(node.id);
                    queue.push(node.id);
                }
            });
        }
        return result;
    }
}
