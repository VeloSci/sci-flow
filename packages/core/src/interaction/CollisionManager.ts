import { StateManager } from '../state/StateManager';
import { Position } from '../types';

export type CollisionMode = 'none' | 'push' | 'block';

/** Detects and resolves node collisions during drag operations. */
export class CollisionManager {
    constructor(
        private stateManager: StateManager,
        public mode: CollisionMode = 'push'
    ) {}

    /** Check if moving `nodeId` to `newPos` would collide, and resolve if needed. */
    public resolve(nodeId: string, newPos: Position): Position {
        if (this.mode === 'none') return newPos;

        const state = this.stateManager.getState();
        const dragged = state.nodes.get(nodeId);
        if (!dragged) return newPos;

        const dw = dragged.style?.width || 200;
        const dh = dragged.style?.height || 150;
        const gap = 12; // Slightly larger gap for scientific look

        // In block mode, we check if any static node would be hit
        if (this.mode === 'block') {
            for (const [id, node] of state.nodes.entries()) {
                if (id === nodeId) continue;
                const nw = node.style?.width || 200;
                const nh = node.style?.height || 150;

                if (newPos.x < node.position.x + nw + gap &&
                    newPos.x + dw + gap > node.position.x &&
                    newPos.y < node.position.y + nh + gap &&
                    newPos.y + dh + gap > node.position.y) {
                    return dragged.position; // Return original if blocked
                }
            }
            return newPos;
        }

        // Push mode: recurse to solve chain reactions
        const visited = new Set<string>([nodeId]);
        this.resolvePush(newPos, dw, dh, gap, visited);
        return newPos;
    }

    private resolvePush(pos: Position, w: number, h: number, gap: number, visited: Set<string>) {
        const state = this.stateManager.getState();

        for (const [id, node] of state.nodes.entries()) {
            if (visited.has(id)) continue;

            const nw = node.style?.width || 200;
            const nh = node.style?.height || 150;

            if (pos.x < node.position.x + nw + gap &&
                pos.x + w + gap > node.position.x &&
                pos.y < node.position.y + nh + gap &&
                pos.y + h + gap > node.position.y) {

                // Collided! Calculate push vector
                const overlapX = this.getOverlap(pos.x, w, node.position.x, nw, gap);
                const overlapY = this.getOverlap(pos.y, h, node.position.y, nh, gap);

                let pushX = 0;
                let pushY = 0;

                if (Math.abs(overlapX) < Math.abs(overlapY)) {
                    pushX = overlapX;
                } else {
                    pushY = overlapY;
                }

                const nextPos = { x: node.position.x + pushX, y: node.position.y + pushY };
                visited.add(id);
                
                // Recursively push
                this.resolvePush(nextPos, nw, nh, gap, visited);
                
                // Finally update state
                this.stateManager.updateNodePosition(id, nextPos.x, nextPos.y, true);
            }
        }
    }

    private getOverlap(
        aPos: number, aSize: number,
        bPos: number, bSize: number,
        gap: number
    ): number {
        const aCenter = aPos + aSize / 2;
        const bCenter = bPos + bSize / 2;
        if (aCenter < bCenter) {
            return (aPos + aSize + gap) - bPos;
        } else {
            return -((bPos + bSize + gap) - aPos);
        }
    }

    /** Get all pairs of overlapping nodes. */
    public getOverlappingPairs(): Array<[string, string]> {
        const pairs: Array<[string, string]> = [];
        const state = this.stateManager.getState();
        const nodes = Array.from(state.nodes.entries());

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const [idA, a] = nodes[i];
                const [idB, b] = nodes[j];
                const aw = a.style?.width || 200;
                const ah = a.style?.height || 150;
                const bw = b.style?.width || 200;
                const bh = b.style?.height || 150;

                if (a.position.x < b.position.x + bw &&
                    a.position.x + aw > b.position.x &&
                    a.position.y < b.position.y + bh &&
                    a.position.y + ah > b.position.y) {
                    pairs.push([idA, idB]);
                }
            }
        }
        return pairs;
    }
}
