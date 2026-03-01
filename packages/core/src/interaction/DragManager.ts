import { StateManager } from '../state/StateManager';
import { Position } from '../types';
import { getDescendants } from '../utils/graph';

export interface DragOptions {
    snapToGrid: boolean;
    gridSize: number;
    showSmartGuides: boolean;
}

export class DragManager {
    private isDraggingNodes = false;
    private draggedNodeIds: string[] = [];
    private lastDragPos: Position | null = null;

    constructor(
        private container: HTMLElement,
        private stateManager: StateManager,
        private plugins: import('../plugins/PluginHost').PluginHost | undefined,
        private options: DragOptions
    ) {}

    public startDrag(itemIds: string[], flowPos: Position, pointerId: number): void {
        this.isDraggingNodes = true;
        this.draggedNodeIds = itemIds;
        this.lastDragPos = flowPos;
        this.container.setPointerCapture(pointerId);
        this.container.classList.add('sci-flow-dragging');
    }

    public updateDrag(flowPos: Position, e: PointerEvent): void {
        if (!this.isDraggingNodes || !this.lastDragPos) return;

        const state = this.stateManager.getState();
        let dx = flowPos.x - this.lastDragPos.x;
        let dy = flowPos.y - this.lastDragPos.y;

        const guides: { x?: number, y?: number }[] = [];

        if (this.draggedNodeIds.length === 1 && !e.altKey) {
            const id = this.draggedNodeIds[0];
            const node = state.nodes.get(id);
            if (node) {
                let newX = node.position.x + dx;
                let newY = node.position.y + dy;
                const nw = node.style?.width || 200;
                const nh = node.style?.height || 150;
                
                let snappedX = false;
                let snappedY = false;
                const SNAP_DISTANCE = 10 / state.viewport.zoom;

                if (this.options.showSmartGuides) {
                    const centerX = newX + nw / 2;
                    const centerY = newY + nh / 2;
                    
                    for (const [otherId, otherNode] of state.nodes.entries()) {
                        if (otherId === id) continue;
                        const onw = otherNode.style?.width || 200;
                        const onh = otherNode.style?.height || 150;
                        const otherCenterX = otherNode.position.x + onw / 2;
                        const otherCenterY = otherNode.position.y + onh / 2;

                        if (!snappedX) {
                            const alignmentsX = [
                                { target: otherNode.position.x, guide: otherNode.position.x },
                                { target: otherCenterX, guide: otherCenterX },
                                { target: otherNode.position.x + onw, guide: otherNode.position.x + onw }
                            ];
                            for (const align of alignmentsX) {
                                if (Math.abs(newX - align.target) < SNAP_DISTANCE) { newX = align.target; snappedX = true; guides.push({ x: align.guide }); break; }
                                if (Math.abs(centerX - align.target) < SNAP_DISTANCE) { newX = align.target - nw / 2; snappedX = true; guides.push({ x: align.guide }); break; }
                                if (Math.abs(newX + nw - align.target) < SNAP_DISTANCE) { newX = align.target - nw; snappedX = true; guides.push({ x: align.guide }); break; }
                            }
                        }
                        if (!snappedY) {
                            const alignmentsY = [
                                { target: otherNode.position.y, guide: otherNode.position.y },
                                { target: otherCenterY, guide: otherCenterY },
                                { target: otherNode.position.y + onh, guide: otherNode.position.y + onh }
                            ];
                            for (const align of alignmentsY) {
                                if (Math.abs(newY - align.target) < SNAP_DISTANCE) { newY = align.target; snappedY = true; guides.push({ y: align.guide }); break; }
                                if (Math.abs(centerY - align.target) < SNAP_DISTANCE) { newY = align.target - nh / 2; snappedY = true; guides.push({ y: align.guide }); break; }
                                if (Math.abs(newY + nh - align.target) < SNAP_DISTANCE) { newY = align.target - nh; snappedY = true; guides.push({ y: align.guide }); break; }
                            }
                        }
                    }
                }

                // Collision Resolution
                if (this.plugins?.collision && !e.altKey) {
                    const collidedPos = this.plugins.collision.resolve(id, { x: newX, y: newY });
                    newX = collidedPos.x;
                    newY = collidedPos.y;
                }

                dx = newX - node.position.x;
                dy = newY - node.position.y;
            }
        } else if (this.options.snapToGrid && !e.altKey) {
            dx = Math.round(dx / this.options.gridSize) * this.options.gridSize;
            dy = Math.round(dy / this.options.gridSize) * this.options.gridSize;
        }

        this.stateManager.setSmartGuides(guides.length > 0 ? guides : undefined);

        if (dx !== 0 || dy !== 0) {
            const idsToMove = new Set([...this.draggedNodeIds, ...getDescendants(state.nodes, this.draggedNodeIds)]);
            idsToMove.forEach(id => {
                if (id.startsWith('note-') && this.plugins) {
                    const note = this.plugins.stickyNotes.get(id);
                    if (note && !note.pinned) {
                        this.plugins.stickyNotes.move(id, note.position.x + dx, note.position.y + dy);
                    }
                } else {
                    const node = state.nodes.get(id);
                    if (node) this.stateManager.updateNodePosition(id, node.position.x + dx, node.position.y + dy, true);
                }
            });
            this.lastDragPos = { x: this.lastDragPos.x + dx, y: this.lastDragPos.y + dy };
        }
    }

    public endDrag(pointerId: number): void {
        if (!this.isDraggingNodes) return;
        this.isDraggingNodes = false;
        this.container.classList.remove('sci-flow-dragging');
        if (this.lastDragPos) {
            this.stateManager.commitNodePositions();
            this.stateManager.saveSnapshot();
        }
        this.lastDragPos = null;
        this.stateManager.clearSmartGuides();
        if (this.container.hasPointerCapture(pointerId)) this.container.releasePointerCapture(pointerId);
    }

    public isDragging(): boolean { return this.isDraggingNodes; }
}
