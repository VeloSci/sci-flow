import { StateManager } from '../state/StateManager';
import type { Position } from '../types';

export type LayoutAlgorithm = 'dagre' | 'force' | 'grid' | 'radial';

export interface LayoutOptions {
    direction?: 'TB' | 'LR' | 'BT' | 'RL';
    nodeSpacing?: number;
    rankSpacing?: number;
    iterations?: number;
}

/** Auto-arrange layout algorithms (dagre, force, grid, radial). */
export class LayoutManager {
    constructor(private stateManager: StateManager) {}

    /** Calculate new positions for all nodes using the given algorithm. */
    public computeLayout(algorithm: LayoutAlgorithm, options?: LayoutOptions): Map<string, Position> {
        const state = this.stateManager.getState();
        const nodes = [...state.nodes.values()];
        const edges = [...state.edges.values()];
        const spacing = options?.nodeSpacing || 200;
        const rankSpacing = options?.rankSpacing || 150;

        switch (algorithm) {
            case 'grid': return this.gridLayout(nodes, spacing);
            case 'dagre': return this.dagreLayout(nodes, edges, spacing, rankSpacing, options?.direction);
            case 'force': return this.forceLayout(nodes, edges, spacing, options?.iterations);
            case 'radial': return this.radialLayout(nodes, spacing);
        }
    }

    /** Apply computed positions to nodes (optionally animate). */
    public applyLayout(positions: Map<string, Position>) {
        const state = this.stateManager.getState();
        positions.forEach((pos, id) => {
            const node = state.nodes.get(id);
            if (node) node.position = pos;
        });
    }

    private gridLayout(nodes: { id: string }[], spacing: number): Map<string, Position> {
        const cols = Math.ceil(Math.sqrt(nodes.length));
        const result = new Map<string, Position>();
        nodes.forEach((node, i) => {
            result.set(node.id, { x: (i % cols) * spacing + 50, y: Math.floor(i / cols) * spacing + 50 });
        });
        return result;
    }

    private dagreLayout(
        nodes: { id: string }[], edges: { source: string; target: string }[],
        spacing: number, rankSpacing: number, direction?: string
    ): Map<string, Position> {
        // Simple topological-sort based hierarchical layout
        const adj = new Map<string, string[]>();
        const inDeg = new Map<string, number>();
        nodes.forEach(n => { adj.set(n.id, []); inDeg.set(n.id, 0); });
        edges.forEach(e => {
            adj.get(e.source)?.push(e.target);
            inDeg.set(e.target, (inDeg.get(e.target) || 0) + 1);
        });
        const ranks: string[][] = [];
        const visited = new Set<string>();
        let queue = nodes.filter(n => (inDeg.get(n.id) || 0) === 0).map(n => n.id);
        while (queue.length > 0) {
            ranks.push(queue);
            queue.forEach(id => visited.add(id));
            const next: string[] = [];
            for (const id of queue) {
                for (const child of (adj.get(id) || [])) {
                    if (!visited.has(child) && !next.includes(child)) next.push(child);
                }
            }
            queue = next;
        }
        // Place unvisited (cycles)
        nodes.forEach(n => { if (!visited.has(n.id)) ranks.push([n.id]); });

        const isHoriz = direction === 'LR' || direction === 'RL';
        const result = new Map<string, Position>();
        ranks.forEach((rank, r) => {
            rank.forEach((id, i) => {
                const x = isHoriz ? r * rankSpacing + 50 : i * spacing + 50;
                const y = isHoriz ? i * spacing + 50 : r * rankSpacing + 50;
                result.set(id, { x, y });
            });
        });
        return result;
    }

    private forceLayout(
        nodes: { id: string; position: Position }[], edges: { source: string; target: string }[],
        spacing: number, iterations = 100
    ): Map<string, Position> {
        // Simple force-directed: repulsion between nodes, attraction on edges
        const pos = new Map<string, { x: number; y: number }>();
        nodes.forEach(n => pos.set(n.id, { ...n.position }));

        for (let iter = 0; iter < iterations; iter++) {
            const forces = new Map<string, { fx: number; fy: number }>();
            nodes.forEach(n => forces.set(n.id, { fx: 0, fy: 0 }));
            const cooling = 1 - iter / iterations;
            // Repulsion
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = pos.get(nodes[i].id)!; const b = pos.get(nodes[j].id)!;
                    const dx = b.x - a.x; const dy = b.y - a.y;
                    const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
                    const force = (spacing * spacing) / dist;
                    const fx = (dx / dist) * force; const fy = (dy / dist) * force;
                    forces.get(nodes[i].id)!.fx -= fx; forces.get(nodes[i].id)!.fy -= fy;
                    forces.get(nodes[j].id)!.fx += fx; forces.get(nodes[j].id)!.fy += fy;
                }
            }
            // Attraction
            edges.forEach(e => {
                const a = pos.get(e.source); const b = pos.get(e.target);
                if (!a || !b) return;
                const dx = b.x - a.x; const dy = b.y - a.y;
                const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
                const force = dist / spacing;
                const fx = (dx / dist) * force; const fy = (dy / dist) * force;
                forces.get(e.source)!.fx += fx; forces.get(e.source)!.fy += fy;
                forces.get(e.target)!.fx -= fx; forces.get(e.target)!.fy -= fy;
            });
            // Apply
            nodes.forEach(n => {
                const p = pos.get(n.id)!; const f = forces.get(n.id)!;
                p.x += f.fx * cooling * 0.1;
                p.y += f.fy * cooling * 0.1;
            });
        }
        return pos as Map<string, Position>;
    }

    private radialLayout(nodes: { id: string }[], spacing: number): Map<string, Position> {
        const result = new Map<string, Position>();
        const cx = 400; const cy = 400;
        const radius = spacing * Math.max(1, nodes.length / (2 * Math.PI));
        nodes.forEach((node, i) => {
            const angle = (2 * Math.PI * i) / nodes.length;
            result.set(node.id, { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
        });
        return result;
    }
}
