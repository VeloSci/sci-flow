import { StateManager } from '../state/StateManager';
import type { Node } from '../types';

export interface SearchResult {
    nodeId: string;
    matchField: string;
    matchValue: string;
}

/** Search & filter nodes by type, title, or data content. */
export class SearchManager {
    private highlights = new Set<string>();

    constructor(private stateManager: StateManager) {}

    /** Search nodes matching query (case-insensitive). */
    public search(query: string): SearchResult[] {
        if (!query.trim()) { this.clearHighlights(); return []; }
        const state = this.stateManager.getState();
        const results: SearchResult[] = [];
        const q = query.toLowerCase();

        state.nodes.forEach((node) => {
            if (node.id.toLowerCase().includes(q)) {
                results.push({ nodeId: node.id, matchField: 'id', matchValue: node.id });
            } else if (node.type.toLowerCase().includes(q)) {
                results.push({ nodeId: node.id, matchField: 'type', matchValue: node.type });
            } else if (this.searchData(node, q)) {
                results.push({ nodeId: node.id, matchField: 'data', matchValue: String(node.data?.title || '') });
            }
        });

        this.highlights = new Set(results.map(r => r.nodeId));
        return results;
    }

    private searchData(node: Node, query: string): boolean {
        if (!node.data) return false;
        return JSON.stringify(node.data).toLowerCase().includes(query);
    }

    /** Filter nodes by type. */
    public filterByType(type: string): SearchResult[] {
        const state = this.stateManager.getState();
        const results: SearchResult[] = [];
        state.nodes.forEach((node) => {
            if (node.type === type) {
                results.push({ nodeId: node.id, matchField: 'type', matchValue: node.type });
            }
        });
        this.highlights = new Set(results.map(r => r.nodeId));
        return results;
    }

    /** Check if a node is highlighted by search. */
    public isHighlighted(nodeId: string): boolean { return this.highlights.has(nodeId); }

    /** Get all highlighted node IDs. */
    public getHighlighted(): string[] { return [...this.highlights]; }

    /** Clear all highlights. */
    public clearHighlights() { this.highlights.clear(); }
}
