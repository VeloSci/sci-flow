import { StateManager } from '../state/StateManager';

export interface EdgeBundle {
    sourceId: string;
    targetId: string;
    edgeIds: string[];
    expanded: boolean;
}

/** Bundles parallel edges between the same node pairs. */
export class EdgeBundler {
    private bundles = new Map<string, EdgeBundle>();

    constructor(private stateManager: StateManager) {}

    /** Detect and create bundles for parallel edges. */
    public detectBundles() {
        this.bundles.clear();
        const state = this.stateManager.getState();
        const pairMap = new Map<string, string[]>();

        state.edges.forEach(edge => {
            const key = [edge.source, edge.target].sort().join('|');
            if (!pairMap.has(key)) pairMap.set(key, []);
            pairMap.get(key)!.push(edge.id);
        });

        pairMap.forEach((edgeIds, key) => {
            if (edgeIds.length < 2) return;
            const [sourceId, targetId] = key.split('|');
            this.bundles.set(key, { sourceId, targetId, edgeIds, expanded: false });
        });
    }

    /** Toggle a bundle's expanded state. */
    public toggleBundle(bundleKey: string) {
        const bundle = this.bundles.get(bundleKey);
        if (bundle) bundle.expanded = !bundle.expanded;
    }

    /** Get visual offset for an edge within a bundle (for stacking). */
    public getEdgeOffset(edgeId: string): number {
        for (const bundle of this.bundles.values()) {
            const idx = bundle.edgeIds.indexOf(edgeId);
            if (idx >= 0 && !bundle.expanded) {
                const center = (bundle.edgeIds.length - 1) / 2;
                return (idx - center) * 6;  // 6px offset per edge
            }
        }
        return 0;
    }

    /** Check if an edge is part of a bundle. */
    public isBundled(edgeId: string): boolean {
        for (const bundle of this.bundles.values()) {
            if (bundle.edgeIds.includes(edgeId) && bundle.edgeIds.length > 1) return true;
        }
        return false;
    }

    public getBundles(): EdgeBundle[] { return [...this.bundles.values()]; }
}
