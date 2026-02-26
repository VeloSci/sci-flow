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
        const gap = 8;

        for (const [id, node] of state.nodes.entries()) {
            if (id === nodeId) continue;
            const nw = node.style?.width || 200;
            const nh = node.style?.height || 150;

            // Check overlap
            if (newPos.x < node.position.x + nw + gap &&
                newPos.x + dw + gap > node.position.x &&
                newPos.y < node.position.y + nh + gap &&
                newPos.y + dh + gap > node.position.y) {

                if (this.mode === 'block') {
                    return dragged.position; // Don't move at all
                }

                // Push mode: nudge the colliding node away
                const overlapX = this.getOverlap(
                    newPos.x, dw, node.position.x, nw, gap
                );
                const overlapY = this.getOverlap(
                    newPos.y, dh, node.position.y, nh, gap
                );

                // Push in the direction of smaller overlap
                if (Math.abs(overlapX) < Math.abs(overlapY)) {
                    this.stateManager.updateNodePosition(
                        id, node.position.x + overlapX, node.position.y, true
                    );
                } else {
                    this.stateManager.updateNodePosition(
                        id, node.position.x, node.position.y + overlapY, true
                    );
                }
            }
        }

        return newPos;
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
