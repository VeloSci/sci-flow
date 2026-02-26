import { StateManager } from '../state/StateManager';

export interface HelperLine {
    type: 'horizontal' | 'vertical';
    position: number;
    matchedNodeId: string;
}

/** Shows alignment guide lines when dragging nodes near other nodes. */
export class HelperLinesManager {
    public snapThreshold = 8;
    public enabled = true;
    private activeLines: HelperLine[] = [];

    constructor(private stateManager: StateManager) {}

    /** Compute helper lines for a node being dragged at (x, y). Returns snap offsets + lines. */
    public computeHelperLines(dragNodeId: string, x: number, y: number): {
        snapX: number; snapY: number; lines: HelperLine[];
    } {
        if (!this.enabled) return { snapX: x, snapY: y, lines: [] };
        const state = this.stateManager.getState();
        const dragNode = state.nodes.get(dragNodeId);
        if (!dragNode) return { snapX: x, snapY: y, lines: [] };

        const dw = dragNode.style?.width || 200;
        const dh = dragNode.style?.height || 150;
        const lines: HelperLine[] = [];
        let snapX = x, snapY = y;

        state.nodes.forEach((node) => {
            if (node.id === dragNodeId) return;
            const nw = node.style?.width || 200;
            const nh = node.style?.height || 150;
            const nx = node.position.x;
            const ny = node.position.y;

            // Vertical alignments: left, center, right
            const vAligns = [
                { drag: x, target: nx },                           // left-left
                { drag: x + dw / 2, target: nx + nw / 2 },        // center-center
                { drag: x + dw, target: nx + nw },                 // right-right
                { drag: x, target: nx + nw },                      // left-right
                { drag: x + dw, target: nx },                      // right-left
            ];
            for (const a of vAligns) {
                if (Math.abs(a.drag - a.target) < this.snapThreshold) {
                    snapX = x + (a.target - a.drag);
                    lines.push({ type: 'vertical', position: a.target, matchedNodeId: node.id });
                    break;
                }
            }

            // Horizontal alignments: top, center, bottom
            const hAligns = [
                { drag: y, target: ny },
                { drag: y + dh / 2, target: ny + nh / 2 },
                { drag: y + dh, target: ny + nh },
                { drag: y, target: ny + nh },
                { drag: y + dh, target: ny },
            ];
            for (const a of hAligns) {
                if (Math.abs(a.drag - a.target) < this.snapThreshold) {
                    snapY = y + (a.target - a.drag);
                    lines.push({ type: 'horizontal', position: a.target, matchedNodeId: node.id });
                    break;
                }
            }
        });

        this.activeLines = lines;
        return { snapX, snapY, lines };
    }

    public getActiveLines(): HelperLine[] { return this.activeLines; }
    public clearLines() { this.activeLines = []; }
}
