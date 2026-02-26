import { StateManager } from '../state/StateManager';

export interface NodeGroup {
    id: string;
    label: string;
    nodeIds: Set<string>;
    collapsed: boolean;
    color: string;
    position?: { x: number; y: number };
}

/** Groups nodes into collapsible container sub-graphs. */
export class GroupManager {
    private groups = new Map<string, NodeGroup>();
    private nodeToGroup = new Map<string, string>();

    constructor(private stateManager: StateManager) {}

    public createGroup(label: string, nodeIds: string[], color = '#4ecdc4'): NodeGroup {
        const id = `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const group: NodeGroup = { id, label, nodeIds: new Set(nodeIds), collapsed: false, color };
        this.groups.set(id, group);
        nodeIds.forEach(nid => this.nodeToGroup.set(nid, id));
        this.updateGroupBounds(id);
        return group;
    }

    public deleteGroup(groupId: string) {
        const group = this.groups.get(groupId);
        if (!group) return;
        group.nodeIds.forEach(nid => this.nodeToGroup.delete(nid));
        this.groups.delete(groupId);
    }

    public addToGroup(groupId: string, nodeId: string) {
        const group = this.groups.get(groupId);
        if (!group) return;
        group.nodeIds.add(nodeId);
        this.nodeToGroup.set(nodeId, groupId);
    }

    public removeFromGroup(nodeId: string) {
        const gid = this.nodeToGroup.get(nodeId);
        if (!gid) return;
        this.groups.get(gid)?.nodeIds.delete(nodeId);
        this.nodeToGroup.delete(nodeId);
    }

    public getGroupForNode(nodeId: string): NodeGroup | undefined {
        const gid = this.nodeToGroup.get(nodeId);
        return gid ? this.groups.get(gid) : undefined;
    }

    public toggleCollapse(groupId: string) {
        const group = this.groups.get(groupId);
        if (!group) return;
        group.collapsed = !group.collapsed;
    }

    /** Move all group members by delta. */
    public moveGroup(groupId: string, dx: number, dy: number) {
        const group = this.groups.get(groupId);
        if (!group) return;
        const state = this.stateManager.getState();
        group.nodeIds.forEach(nid => {
            const node = state.nodes.get(nid);
            if (node) {
                node.position.x += dx;
                node.position.y += dy;
            }
        });
    }

    /** Compute bounding box of the group. */
    public getGroupBounds(groupId: string): { x: number; y: number; width: number; height: number } | null {
        const group = this.groups.get(groupId);
        if (!group || group.nodeIds.size === 0) return null;
        const state = this.stateManager.getState();
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        group.nodeIds.forEach(nid => {
            const n = state.nodes.get(nid);
            if (!n) return;
            const w = n.style?.width || 200;
            const h = n.style?.height || 150;
            minX = Math.min(minX, n.position.x);
            minY = Math.min(minY, n.position.y);
            maxX = Math.max(maxX, n.position.x + w);
            maxY = Math.max(maxY, n.position.y + h);
        });
        return { x: minX - 20, y: minY - 40, width: maxX - minX + 40, height: maxY - minY + 60 };
    }

    private updateGroupBounds(groupId: string) {
        const bounds = this.getGroupBounds(groupId);
        const group = this.groups.get(groupId);
        if (bounds && group) {
            group.position = { x: bounds.x, y: bounds.y };
        }
    }

    public getAllGroups(): NodeGroup[] { return [...this.groups.values()]; }
    public getGroup(id: string): NodeGroup | undefined { return this.groups.get(id); }
}
