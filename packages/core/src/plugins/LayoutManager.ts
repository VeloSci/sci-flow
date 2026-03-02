import { StateManager } from '../state/StateManager';
import type { Position, Node, Edge } from '../types';

export type LayoutAlgorithm = 'dagre' | 'force' | 'grid' | 'radial';

export interface LayoutOptions {
    direction?: 'TB' | 'LR' | 'BT' | 'RL';
    nodeSpacing?: number;
    rankSpacing?: number;
    iterations?: number;
}

/** Auto-arrange layout algorithms (dagre, force, grid, radial). */
export class LayoutManager {
    constructor(private stateManager: StateManager) { }

    /** Calculate new positions for all nodes using the given algorithm. */
    public computeLayout(algorithm: LayoutAlgorithm, options?: LayoutOptions): Map<string, Position> {
        const state = this.stateManager.getState();
        const nodes = [...state.nodes.values()];
        const edges = [...state.edges.values()];
        const spacing = options?.nodeSpacing || 100; // Separation between nodes in same rank
        const rankSpacing = options?.rankSpacing || 180; // Separation between ranks

        // Determine direction: options > state > default TB
        let layoutDir = options?.direction;
        if (!layoutDir) {
            const flowDir = state.direction || 'horizontal';
            layoutDir = flowDir === 'horizontal' ? 'LR' : 'TB';
        }

        switch (algorithm) {
            case 'grid': return this.gridLayout(nodes, spacing);
            case 'dagre': return this.dagreLayout(nodes, edges, spacing, rankSpacing, layoutDir);
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

    private gridLayout(nodes: Node[], spacing: number): Map<string, Position> {
        const cols = Math.ceil(Math.sqrt(nodes.length));
        const result = new Map<string, Position>();
        nodes.forEach((node, i) => {
            result.set(node.id, { x: (i % cols) * spacing + 50, y: Math.floor(i / cols) * spacing + 50 });
        });
        return result;
    }

    private dagreLayout(
        nodes: Node[], edges: Edge[],
        spacing: number, rankSpacing: number, direction?: 'TB' | 'LR' | 'BT' | 'RL'
    ): Map<string, Position> {
        const isHoriz = direction === 'LR' || direction === 'RL';
        const nodeMap = new Map<string, Node>(nodes.map(n => [n.id, n]));

        // 1. Layering (Simple BFS/Topological Sort)
        const adj = new Map<string, string[]>();
        const revAdj = new Map<string, string[]>();
        const inDeg = new Map<string, number>();
        nodes.forEach(n => {
            adj.set(n.id, []);
            revAdj.set(n.id, []);
            inDeg.set(n.id, 0);
        });
        edges.forEach(e => {
            adj.get(e.source)?.push(e.target);
            revAdj.get(e.target)?.push(e.source);
            inDeg.set(e.target, (inDeg.get(e.target) || 0) + 1);
        });

        // Phase 1: Rank nodes (Handle Cycles with DFS)
        const nodeRanks = new Map<string, number>();
        const visited = new Set<string>();
        const stack = new Set<string>();
        const backEdges: { source: string; target: string }[] = [];

        const breakCycles = (id: string) => {
            visited.add(id);
            stack.add(id);
            for (const neighbor of adj.get(id) || []) {
                if (stack.has(neighbor)) {
                    backEdges.push({ source: id, target: neighbor });
                } else if (!visited.has(neighbor)) {
                    breakCycles(neighbor);
                }
            }
            stack.delete(id);
        };

        nodes.forEach(n => { if (!visited.has(n.id)) breakCycles(n.id); });

        // Filter out back-edges for ranking
        const rankingEdges = edges.filter(e => !backEdges.some(be => be.source === e.source && be.target === e.target));

        // Re-calculate in-degrees for DAG
        const dagInDeg = new Map<string, number>();
        nodes.forEach(n => dagInDeg.set(n.id, 0));
        rankingEdges.forEach(e => dagInDeg.set(e.target, (dagInDeg.get(e.target) || 0) + 1));

        const queue = nodes.filter(n => (dagInDeg.get(n.id) || 0) === 0).map(n => n.id);
        let maxRank = 0;
        let rankIdx = 0;
        let currentLevel = queue;
        visited.clear();

        while (currentLevel.length > 0) {
            const nextLevel: string[] = [];
            for (const id of currentLevel) {
                if (visited.has(id)) continue;
                visited.add(id);
                nodeRanks.set(id, rankIdx);
                for (const child of (adj.get(id) || [])) {
                    // Skip back edges for ranking
                    if (backEdges.some(be => be.source === id && be.target === child)) continue;
                    if (!visited.has(child)) nextLevel.push(child);
                }
            }
            currentLevel = Array.from(new Set(nextLevel));
            if (currentLevel.length > 0) rankIdx++;
        }
        maxRank = rankIdx;

        // Ensure all nodes (including cycles) have a rank
        nodes.forEach(n => {
            if (!nodeRanks.has(n.id)) {
                nodeRanks.set(n.id, maxRank);
            }
        });

        // Group into layers
        const levels: string[][] = Array.from({ length: maxRank + 1 }, () => []);
        nodeRanks.forEach((rank, id) => levels[rank].push(id));

        // 2. Vertex Ordering (Barycenter + Transpose)
        const iterations = 12;
        for (let iter = 0; iter < iterations; iter++) {
            const forward = iter % 2 === 0;
            const start = forward ? 1 : levels.length - 2;
            const end = forward ? levels.length : -1;
            const step = forward ? 1 : -1;

            for (let i = start; i !== end; i += step) {
                const layer = levels[i];
                const neighborLevel = levels[forward ? i - 1 : i + 1];
                const neighborPositions = new Map<string, number>(neighborLevel.map((id, idx) => [id, idx]));

                // Barycenter Pass
                const barycenters = new Map<string, number>();
                layer.forEach(id => {
                    const neighbors = (forward ? revAdj : adj).get(id) || [];
                    const inNeighborLevel = neighbors.filter(n => neighborPositions.has(n));
                    if (inNeighborLevel.length === 0) {
                        barycenters.set(id, 0.5);
                    } else {
                        const sum = inNeighborLevel.reduce((acc, p) => acc + (neighborPositions.get(p) ?? 0), 0);
                        barycenters.set(id, sum / inNeighborLevel.length);
                    }
                });
                layer.sort((a, b) => (barycenters.get(a) ?? 0) - (barycenters.get(b) ?? 0));

                // Transpose Pass (Improved local search)
                let improved = true;
                let transposeIter = 0;
                while (improved && transposeIter < 2) {
                    improved = false;
                    for (let j = 0; j < layer.length - 1; j++) {
                        const v = layer[j];
                        const w = layer[j + 1];
                        if (this.calculateCrossings(v, w, neighborPositions, forward ? revAdj : adj) >
                            this.calculateCrossings(w, v, neighborPositions, forward ? revAdj : adj)) {
                            layer[j] = w;
                            layer[j + 1] = v;
                            improved = true;
                        }
                    }
                    transposeIter++;
                }
            }
        }

        // 3. Coordinate Assignment (Balanced Centering)
        const result = new Map<string, Position>();
        const levelOffsets: number[] = [];
        let currentTotalOffset = 50;

        // Calculate layer breadths and offsets (Rank-axis)
        levels.forEach((level) => {
            let maxInRank = 0;
            level.forEach(id => {
                const node = nodeMap.get(id);
                const size = isHoriz ? (node?.style?.width || 180) : (node?.style?.height || 120);
                maxInRank = Math.max(maxInRank, size);
            });
            levelOffsets.push(currentTotalOffset);
            currentTotalOffset += maxInRank + rankSpacing;
        });

        // 4. Cross-axis Centering (Balanced)
        const maxLevelSize = Math.max(...levels.map(l => {
            return l.reduce((acc, id) => {
                const node = nodeMap.get(id);
                return acc + (isHoriz ? (node?.style?.height || 120) : (node?.style?.width || 180)) + spacing;
            }, -spacing);
        }));

        levels.forEach((level, r) => {
            const rankOffset = levelOffsets[r];
            const currentLevelSize = level.reduce((acc, id) => {
                const node = nodeMap.get(id);
                return acc + (isHoriz ? (node?.style?.height || 120) : (node?.style?.width || 180)) + spacing;
            }, -spacing);

            let crossOffset = (maxLevelSize - currentLevelSize) / 2 + 50;

            level.forEach(id => {
                const node = nodeMap.get(id)!;
                const nodeWidth = node.style?.width || 180;
                const nodeHeight = node.style?.height || 120;

                const finalX = isHoriz ? rankOffset : crossOffset;
                const finalY = isHoriz ? crossOffset : rankOffset;

                result.set(id, { x: finalX, y: finalY });
                crossOffset += (isHoriz ? nodeHeight : nodeWidth) + spacing;
            });
        });

        return result;
    }

    private calculateCrossings(v: string, w: string, neighborPositions: Map<string, number>, neighborAdj: Map<string, string[]>): number {
        const vNeighbors = neighborAdj.get(v) || [];
        const wNeighbors = neighborAdj.get(w) || [];
        let crossings = 0;
        for (const vn of vNeighbors) {
            const vPos = neighborPositions.get(vn);
            if (vPos === undefined) continue;
            for (const wn of wNeighbors) {
                const wPos = neighborPositions.get(wn);
                if (wPos === undefined) continue;
                if (vPos > wPos) crossings++;
            }
        }
        return crossings;
    }

    private forceLayout(
        nodes: Node[], edges: Edge[],
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

    private radialLayout(nodes: Node[], spacing: number): Map<string, Position> {
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
