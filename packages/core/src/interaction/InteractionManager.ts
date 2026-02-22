import { StateManager } from '../state/StateManager';
import { Position } from '../types';
import { distanceToBezier, distanceToLineSegment } from '../utils/hitDetection';
import { getDescendants } from '../utils/graph';

// Simple UUID generator for new pasted nodes
function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

export interface InteractionOptions {
    container: HTMLElement;
    stateManager: StateManager;
    minZoom?: number;
    maxZoom?: number;
    snapToGrid?: boolean;
    gridSize?: number;
    showSmartGuides?: boolean;
}

export class InteractionManager {
    private container: HTMLElement;
    private stateManager: StateManager;
    private options: Required<Omit<InteractionOptions, 'container' | 'stateManager'>>;

    // State Variables
    private isPanning = false;
    private isSelecting = false;
    private lastPointerPos: Position = { x: 0, y: 0 };
    private selectionStart: Position | null = null;
    
    // UI elements overlay
    private selectionBoxEl: HTMLDivElement | null = null;
    
    // Edge Drafting State
    private draftSourceNodeId: string | null = null;
    private draftSourcePortId: string | null = null;

    // Node Dragging State
    private isDraggingNodes = false;
    private draggedNodeIds: string[] = [];
    private lastDragPos: Position | null = null;

    private cleanupEvents: Array<() => void> = [];

    constructor({ container, stateManager, minZoom = 0.1, maxZoom = 2, snapToGrid = true, gridSize = 20, showSmartGuides = true }: InteractionOptions) {
        this.container = container;
        this.stateManager = stateManager;
        this.options = { minZoom, maxZoom, snapToGrid, gridSize, showSmartGuides };

        this.bindEvents();
    }

    private bindEvents() {
        // Prevent default browser dragging
        this.container.style.touchAction = 'none';

        const onWheel = this.handleWheel.bind(this);
        const onPointerDown = this.handlePointerDown.bind(this);
        const onPointerMove = this.handlePointerMove.bind(this);
        const onPointerUp = this.handlePointerUp.bind(this);
        const onContextMenu = this.handleContextMenu.bind(this);
        const onKeyDown = this.handleKeyDown.bind(this);
        const onKeyUp = this.handleKeyUp.bind(this);
        const onCopy = this.handleCopy.bind(this);
        const onPaste = this.handlePaste.bind(this);
        
        this.container.addEventListener('wheel', onWheel, { passive: false });
        this.container.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        this.container.addEventListener('contextmenu', onContextMenu);
        // Keyboard events are better bound to window to catch shortcuts easily (like Ctrl+A, Delete)
        // TabIndex could be used on container, but window is more reliable for global editor shortcuts.
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        
        // Clipboard events
        window.addEventListener('copy', onCopy);
        window.addEventListener('paste', onPaste);

        this.cleanupEvents = [
            () => this.container.removeEventListener('wheel', onWheel),
            () => this.container.removeEventListener('pointerdown', onPointerDown),
            () => window.removeEventListener('pointermove', onPointerMove),
            () => window.removeEventListener('pointerup', onPointerUp),
            () => this.container.removeEventListener('contextmenu', onContextMenu),
            () => window.removeEventListener('keydown', onKeyDown),
            () => window.removeEventListener('keyup', onKeyUp),
            () => window.removeEventListener('copy', onCopy),
            () => window.removeEventListener('paste', onPaste),
        ];
    }

    private handleWheel(e: WheelEvent) {
        e.preventDefault();
        
        const state = this.stateManager.getState();
        const { x, y, zoom } = state.viewport;
        
        // Panning via Shift or Ctrl/Cmd
        if (e.ctrlKey || e.metaKey || e.shiftKey) {
            this.stateManager.setViewport({
                x: x - e.deltaX,
                y: y - e.deltaY,
                zoom
            });
        } else {
            // Zoom towards mouse cursor
            // DeltaY is typically around 100 per notch. -0.005 was jumping 0.5 zoom levels per notch.
            // A much smoother value is -0.001 to get ~0.1 zoom changes per notch.
            const zoomAmount = e.deltaY * -0.001; 
            const newZoom = Math.min(Math.max(zoom + zoomAmount, this.options.minZoom), this.options.maxZoom);
            
            const rect = this.container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Point in flow space under the mouse
            const flowX = (mouseX - x) / zoom;
            const flowY = (mouseY - y) / zoom;
            
            // New viewport offset to keep flowX/flowY under the mouse
            const newX = mouseX - flowX * newZoom;
            const newY = mouseY - flowY * newZoom;
            
            this.stateManager.setViewport({ x: newX, y: newY, zoom: newZoom });
        }
    }

    private handlePointerDown(e: PointerEvent) {
        // Check if we clicked on a port
        if (e.button === 0) {
            const target = e.target as HTMLElement;
            const portEl = target.closest('.sci-flow-port') as HTMLElement;
            if (portEl && portEl.dataset.nodeid && portEl.dataset.portid) {
                this.draftSourceNodeId = portEl.dataset.nodeid;
                this.draftSourcePortId = portEl.dataset.portid;
                this.container.setPointerCapture(e.pointerId);
                return;
            }
        }

        // Standard left click: hit detection for single selection, or initiate node drag
        if (e.button === 0) {
            const state = this.stateManager.getState();
            const rect = this.container.getBoundingClientRect();
            const flowPos = this.screenToFlow({ x: e.clientX, y: e.clientY }, state.viewport, rect);

            let clickedNodeId: string | null = null;

            // Reverse iterate (top to bottom graphically)
            const nodesArr = Array.from(state.nodes.values());
            for (let i = nodesArr.length - 1; i >= 0; i--) {
                const node = nodesArr[i];
                const nw = node.style?.width || 200;
                const nh = node.style?.height || 150;

                if (flowPos.x >= node.position.x && flowPos.x <= node.position.x + nw &&
                    flowPos.y >= node.position.y && flowPos.y <= node.position.y + nh) {
                    clickedNodeId = node.id;
                    break;
                }
            }

            if (clickedNodeId) {
                // Initiate Dragging
                this.isDraggingNodes = true;
                this.lastDragPos = flowPos;
                this.container.setPointerCapture(e.pointerId);
                this.container.classList.add('sci-flow-dragging');

                const node = state.nodes.get(clickedNodeId);
                if (node && node.selected) {
                     // Drag all currently selected nodes
                     this.draggedNodeIds = Array.from(state.nodes.values()).filter(n => n.selected).map(n => n.id);
                } else {
                     // Clicked an unselected node: select it and drag only it
                     if (e.shiftKey) {
                         this.stateManager.appendSelection(clickedNodeId);
                         this.draggedNodeIds = Array.from(state.nodes.values()).filter(n => n.selected).map(n => n.id);
                     } else {
                         this.stateManager.setSelection([clickedNodeId], []);
                         this.draggedNodeIds = [clickedNodeId];
                     }
                }
                return;
            }

            // If we got here, we clicked the background. Check Edges first.
            let clickedEdgeId: string | null = null;
            
            // 1. FAST NATIVE PATH: If we clicked exactly on the SVG edge background poly-stroke
            const targetEl = e.target as Element;
            const edgePathEl = targetEl.closest('.sci-flow-edge-bg, .sci-flow-edge-fg');
            if (edgePathEl && edgePathEl.parentElement && edgePathEl.parentElement.id.startsWith('edge-group-')) {
                clickedEdgeId = edgePathEl.parentElement.id.substring('edge-group-'.length);
            }

            // 2. MATHEMATICAL FALLBACK: 15px logic radius for hit detection (e.g. for tiny edges zoomed out)
            if (!clickedEdgeId) {
                const HIT_TOLERANCE = 15 / Math.max(0.1, state.viewport.zoom);

                for (const edge of state.edges.values()) {
                    const sourceNode = state.nodes.get(edge.source);
                    const targetNode = state.nodes.get(edge.target);
                    if (!sourceNode || !targetNode) continue;
                    
                    const sW = sourceNode.style?.width || 100;
                    const sH = sourceNode.style?.height || 50;
                    const tH = targetNode.style?.height || 50;

                    const sourcePos = {
                       x: sourceNode.position.x + sW,
                       y: sourceNode.position.y + sH / 2
                    };
                    
                    const targetPos = {
                       x: targetNode.position.x,
                       y: targetNode.position.y + tH / 2
                    };

                    let dist = Infinity;
                    if (edge.type === 'straight') {
                        dist = distanceToLineSegment(flowPos, sourcePos, targetPos);
                    } else {
                        dist = distanceToBezier(flowPos, sourcePos, targetPos);
                    }
                    
                    if (dist < HIT_TOLERANCE) {
                        clickedEdgeId = edge.id;
                        break;
                    }
                }
            }

            if (clickedEdgeId) {
                if (e.shiftKey) {
                     this.stateManager.appendSelection(undefined, clickedEdgeId);
                } else {
                     this.stateManager.setSelection([], [clickedEdgeId]);
                }
                return;
            }

            // Clicked empty space background -> initiate box selection
            if (e.shiftKey) {
                this.isSelecting = true;
                this.selectionStart = { x: e.clientX, y: e.clientY };
                this.container.setPointerCapture(e.pointerId);
                this.createSelectionBox(e.clientX, e.clientY);
                return;
            } else {
                // Clicked empty space without shift -> clear selection
                this.stateManager.setSelection([], []);
            }
        }

        // Right, Middle, or Space+Left click -> Pan
        if (e.button === 1 || e.button === 2 || (e.button === 0 && this.isSpacePressed)) {
            this.isPanning = true;
            this.container.setPointerCapture(e.pointerId);
            this.lastPointerPos = { x: e.clientX, y: e.clientY };
            this.container.style.cursor = 'grabbing';
            return;
        }

        // Standard left click: hit detection for single selection
        if (e.button === 0) {
            this.detectSingleClickSelection(e);
        }
    }

    private handlePointerMove(e: PointerEvent) {
        if (this.draftSourceNodeId && this.draftSourcePortId) {
            const state = this.stateManager.getState();
            const rect = this.container.getBoundingClientRect();
            let flowPos = this.screenToFlow({ x: e.clientX, y: e.clientY }, state.viewport, rect);
            
            // Snapping implementation: find if we are over a port
            const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
            const portEl = target?.closest('.sci-flow-port') as HTMLElement;
            
            if (portEl && portEl.dataset.nodeid !== this.draftSourceNodeId) {
                // We hovered a viable port. Force the floating line mathematically to snap perfectly to the exact center of it.
                const portRect = portEl.getBoundingClientRect();
                const portCenter = {
                    x: portRect.left + portRect.width / 2,
                    y: portRect.top + portRect.height / 2
                };
                flowPos = this.screenToFlow(portCenter, state.viewport, rect);
            }
            
            this.stateManager.setDraftEdge(this.draftSourceNodeId, this.draftSourcePortId, flowPos);
        } else if (this.isDraggingNodes && this.lastDragPos) {
            const state = this.stateManager.getState();
            const rect = this.container.getBoundingClientRect();
            const flowPos = this.screenToFlow({ x: e.clientX, y: e.clientY }, state.viewport, rect);
            
            let dx = flowPos.x - this.lastDragPos.x;
            let dy = flowPos.y - this.lastDragPos.y;
            
            const guides: { x?: number, y?: number }[] = [];
            
            // If dragging exactly one node, we process guides and snapping to its absolute position.
            // For multi-select, we just snap the delta to maintain relative spacing.
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
                    const SNAP_DISTANCE = 10 / state.viewport.zoom; // Magnetism strength
                    
                    // 1. Smart Guides Alignment
                    if (this.options.showSmartGuides) {
                         const centerX = newX + nw / 2;
                         const centerY = newY + nh / 2;
                         
                         for (const [otherId, otherNode] of state.nodes.entries()) {
                             if (otherId === id) continue;
                             
                             const onw = otherNode.style?.width || 200;
                             const onh = otherNode.style?.height || 150;
                             const otherCenterX = otherNode.position.x + onw / 2;
                             const otherCenterY = otherNode.position.y + onh / 2;
                             
                             // X-axis alignment (Left, Center, Right)
                             if (!snappedX) {
                                 const alignmentsX = [
                                     { target: otherNode.position.x, guide: otherNode.position.x }, // Left-Left
                                     { target: otherCenterX, guide: otherCenterX }, // Center-Center
                                     { target: otherNode.position.x + onw, guide: otherNode.position.x + onw } // Right-Right
                                 ];
                                 
                                 for (const align of alignmentsX) {
                                     if (Math.abs(newX - align.target) < SNAP_DISTANCE) {
                                         newX = align.target;
                                         snappedX = true;
                                         guides.push({ x: align.guide });
                                         break;
                                     }
                                     if (Math.abs(centerX - align.target) < SNAP_DISTANCE) {
                                         newX = align.target - nw / 2;
                                         snappedX = true;
                                         guides.push({ x: align.guide });
                                         break;
                                     }
                                     if (Math.abs(newX + nw - align.target) < SNAP_DISTANCE) {
                                         newX = align.target - nw;
                                         snappedX = true;
                                         guides.push({ x: align.guide });
                                         break;
                                     }
                                 }
                             }
                             
                             // Y-axis alignment (Top, Center, Bottom)
                             if (!snappedY) {
                                 const alignmentsY = [
                                     { target: otherNode.position.y, guide: otherNode.position.y }, // Top-Top
                                     { target: otherCenterY, guide: otherCenterY }, // Center-Center
                                     { target: otherNode.position.y + onh, guide: otherNode.position.y + onh } // Bottom-Bottom
                                 ];
                                 
                                 for (const align of alignmentsY) {
                                     if (Math.abs(newY - align.target) < SNAP_DISTANCE) {
                                         newY = align.target;
                                         snappedY = true;
                                         guides.push({ y: align.guide });
                                         break;
                                     }
                                     if (Math.abs(centerY - align.target) < SNAP_DISTANCE) {
                                         newY = align.target - nh / 2;
                                         snappedY = true;
                                         guides.push({ y: align.guide });
                                         break;
                                     }
                                     if (Math.abs(newY + nh - align.target) < SNAP_DISTANCE) {
                                         newY = align.target - nh;
                                         snappedY = true;
                                         guides.push({ y: align.guide });
                                         break;
                                     }
                                 }
                             }
                             
                             if (snappedX && snappedY) break;
                         }
                    }
                    
                    // 2. Fallback to Grid Snap
                    if (this.options.snapToGrid) {
                        if (!snappedX) newX = Math.round(newX / this.options.gridSize) * this.options.gridSize;
                        if (!snappedY) newY = Math.round(newY / this.options.gridSize) * this.options.gridSize;
                    }
                    
                    dx = newX - node.position.x;
                    dy = newY - node.position.y;
                }
            } else if (this.options.snapToGrid && !e.altKey) {
                // Multi-select grid snap
                dx = Math.round(dx / this.options.gridSize) * this.options.gridSize;
                dy = Math.round(dy / this.options.gridSize) * this.options.gridSize;
            }
            
            this.stateManager.setSmartGuides(guides.length > 0 ? guides : undefined as any);
            
            // Only update if there is a deliberate snapped movement or free movement
            if (dx !== 0 || dy !== 0) {
                // Determine all nodes to move (dragged nodes + their descendants)
                const idsToMove = new Set([
                     ...this.draggedNodeIds,
                     ...getDescendants(state.nodes, this.draggedNodeIds)
                ]);

                idsToMove.forEach(id => {
                    const node = state.nodes.get(id);
                    if (node) {
                        this.stateManager.updateNodePosition(id, node.position.x + dx, node.position.y + dy, true);
                    }
                });
                // We must artificially prevent lastDragPos from fully tracking mouse if we snapped
                // Otherwise the node slides behind the cursor heavily on large grids
                this.lastDragPos = {
                     x: this.lastDragPos.x + dx,
                     y: this.lastDragPos.y + dy
                };
            }
            
        } else if (this.isPanning) {
            const dx = e.clientX - this.lastPointerPos.x;
            const dy = e.clientY - this.lastPointerPos.y;
            this.lastPointerPos = { x: e.clientX, y: e.clientY };
            
            const state = this.stateManager.getState();
            this.stateManager.setViewport({
                x: state.viewport.x + dx,
                y: state.viewport.y + dy,
                zoom: state.viewport.zoom
            });
        } else if (this.isSelecting && this.selectionStart && this.selectionBoxEl) {
            const currentX = e.clientX;
            const currentY = e.clientY;
            
            const left = Math.min(this.selectionStart.x, currentX);
            const top = Math.min(this.selectionStart.y, currentY);
            const width = Math.abs(currentX - this.selectionStart.x);
            const height = Math.abs(currentY - this.selectionStart.y);
            
            const rect = this.container.getBoundingClientRect();
            
            this.selectionBoxEl.style.left = `${left - rect.left}px`;
            this.selectionBoxEl.style.top = `${top - rect.top}px`;
            this.selectionBoxEl.style.width = `${width}px`;
            this.selectionBoxEl.style.height = `${height}px`;
        }
    }

    private handlePointerUp(e: PointerEvent) {
        if (this.draftSourceNodeId && this.draftSourcePortId) {
            this.stateManager.clearDraftEdge();

            // Find if we dropped on a port
            const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
            const portEl = target?.closest('.sci-flow-port') as HTMLElement;

            if (portEl && portEl.dataset.nodeid && portEl.dataset.portid) {
                const targetNodeId = portEl.dataset.nodeid;
                const targetPortId = portEl.dataset.portid;

                if (targetNodeId !== this.draftSourceNodeId) {
                    // Create new Edge payload
                    const newEdge = {
                        id: `edge-${Date.now()}`,
                        source: this.draftSourceNodeId,
                        target: targetNodeId,
                        sourceHandle: this.draftSourcePortId,
                        targetHandle: targetPortId,
                        type: 'straight' as any
                    };
                    
                    if (this.stateManager.onConnect) {
                        this.stateManager.onConnect(newEdge);
                    } else {
                        // Default behavior if framework doesn't intercept
                        this.stateManager.addEdge(newEdge);
                    }
                }
            }

            this.draftSourceNodeId = null;
            this.draftSourcePortId = null;
            if (this.container.hasPointerCapture(e.pointerId)) {
                this.container.releasePointerCapture(e.pointerId);
            }
        } else if (this.isDraggingNodes) {
            this.isDraggingNodes = false;
            this.draggedNodeIds = [];
            this.container.classList.remove('sci-flow-dragging');
            
            // Only save snapshot if we actually moved
            if (this.lastDragPos) {
                 this.stateManager.commitNodePositions();
                 this.stateManager.saveSnapshot();
            }
            
            this.lastDragPos = null;
            this.stateManager.clearSmartGuides();
            if (this.container.hasPointerCapture(e.pointerId)) {
                this.container.releasePointerCapture(e.pointerId);
            }
        } else if (this.isPanning) {
            this.isPanning = false;
            if (this.container.hasPointerCapture(e.pointerId)) {
                this.container.releasePointerCapture(e.pointerId);
            }
            this.container.style.cursor = 'default';
        } else if (this.isSelecting) {
            this.isSelecting = false;
            this.resolveSelectionBox();
            if (this.selectionBoxEl) {
                this.selectionBoxEl.remove();
                this.selectionBoxEl = null;
            }
            this.selectionStart = null;
            if (this.container.hasPointerCapture(e.pointerId)) {
                this.container.releasePointerCapture(e.pointerId);
            }
        }
    }

    private createSelectionBox(x: number, y: number) {
        if (!this.selectionBoxEl) {
            this.selectionBoxEl = document.createElement('div');
            this.selectionBoxEl.style.position = 'absolute';
            this.selectionBoxEl.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
            this.selectionBoxEl.style.border = '1px solid rgba(0, 123, 255, 0.5)';
            this.selectionBoxEl.style.pointerEvents = 'none';
            this.selectionBoxEl.style.zIndex = '9999';
            
            const rect = this.container.getBoundingClientRect();
            this.selectionBoxEl.style.left = `${x - rect.left}px`;
            this.selectionBoxEl.style.top = `${y - rect.top}px`;
            this.selectionBoxEl.style.width = '0px';
            this.selectionBoxEl.style.height = '0px';
            
            this.container.appendChild(this.selectionBoxEl);
        }
    }

    private resolveSelectionBox() {
        if (!this.selectionBoxEl || !this.selectionStart) return;
        
        const state = this.stateManager.getState();
        const rect = this.container.getBoundingClientRect();
        
        // Convert screen box to canvas box
        const left = parseFloat(this.selectionBoxEl.style.left) + rect.left;
        const top = parseFloat(this.selectionBoxEl.style.top) + rect.top;
        const width = parseFloat(this.selectionBoxEl.style.width);
        const height = parseFloat(this.selectionBoxEl.style.height);

        // Map box corners to flow coordinates
        const tl = this.screenToFlow({ x: left, y: top }, state.viewport, rect);
        const br = this.screenToFlow({ x: left + width, y: top + height }, state.viewport, rect);

        const flowBox = {
            x: tl.x,
            y: tl.y,
            width: br.x - tl.x,
            height: br.y - tl.y
        };

        const selectedNodes: string[] = [];
        
        // Fast AABB intersection
        state.nodes.forEach(node => {
            const nw = node.style?.width || 200;
            const nh = node.style?.height || 150;
            if (
                node.position.x < flowBox.x + flowBox.width &&
                node.position.x + nw > flowBox.x &&
                node.position.y < flowBox.y + flowBox.height &&
                node.position.y + nh > flowBox.y
            ) {
                selectedNodes.push(node.id);
            }
        });

        this.stateManager.setSelection(selectedNodes, []);
    }

    private detectSingleClickSelection(e: PointerEvent) {
        // We will implement raycasting to nodes/edges
        const state = this.stateManager.getState();
        const rect = this.container.getBoundingClientRect();
        const flowPos = this.screenToFlow({ x: e.clientX, y: e.clientY }, state.viewport, rect);

        let clickedNodeId: string | null = null;

        // Reverse iterate (top to bottom graphically)
        const nodesArr = Array.from(state.nodes.values());
        for (let i = nodesArr.length - 1; i >= 0; i--) {
            const node = nodesArr[i];
            const nw = node.style?.width || 200;
            const nh = node.style?.height || 150;

            if (flowPos.x >= node.position.x && flowPos.x <= node.position.x + nw &&
                flowPos.y >= node.position.y && flowPos.y <= node.position.y + nh) {
                clickedNodeId = node.id;
                break;
            }
        }

        if (clickedNodeId) {
            // Check shift for toggle append
            if (e.shiftKey) {
                 this.stateManager.appendSelection(clickedNodeId);
            } else {
                 this.stateManager.setSelection([clickedNodeId], []);
            }
            return;
        }

        // If no node clicked, check edges
        let clickedEdgeId: string | null = null;
        
        // 1. FAST NATIVE PATH
        const targetEl = e.target as Element;
        const edgePathEl = targetEl.closest('.sci-flow-edge-bg, .sci-flow-edge-fg');
        if (edgePathEl && edgePathEl.parentElement && edgePathEl.parentElement.id.startsWith('edge-group-')) {
            clickedEdgeId = edgePathEl.parentElement.id.substring('edge-group-'.length);
        }

        // 2. MATHEMATICAL FALLBACK
        if (!clickedEdgeId) {
            const HIT_TOLERANCE = 15 / Math.max(0.1, state.viewport.zoom); // Scaled tolerance

            for (const edge of state.edges.values()) {
                const sourceNode = state.nodes.get(edge.source);
                const targetNode = state.nodes.get(edge.target);
                if (!sourceNode || !targetNode) continue;

                const sW = sourceNode.style?.width || 100;
                const sH = sourceNode.style?.height || 50;
                const tH = targetNode.style?.height || 50;

                const sourcePos = {
                   x: sourceNode.position.x + sW,
                   y: sourceNode.position.y + sH / 2
                };
                
                const targetPos = {
                   x: targetNode.position.x,
                   y: targetNode.position.y + tH / 2
                };

                let dist = Infinity;
                if (edge.type === 'straight') {
                    dist = distanceToLineSegment(flowPos, sourcePos, targetPos);
                } else {
                    dist = distanceToBezier(flowPos, sourcePos, targetPos);
                }
                
                if (dist < HIT_TOLERANCE) {
                    clickedEdgeId = edge.id;
                    break;
                }
            }
        }

        if (clickedEdgeId) {
            if (e.shiftKey) {
                 this.stateManager.appendSelection(undefined, clickedEdgeId);
            } else {
                 this.stateManager.setSelection([], [clickedEdgeId]);
            }
        } else {
            // Clicked background -> clear
            this.stateManager.setSelection([], []);
        }
    }

    private handleContextMenu(e: MouseEvent) {
        e.preventDefault(); // Prevent native browser context menu
        
        const state = this.stateManager.getState();
        const rect = this.container.getBoundingClientRect();
        const flowPos = this.screenToFlow({ x: e.clientX, y: e.clientY }, state.viewport, rect);

        // 1. Check if clicked on a Node
        let hitNodeId: string | null = null;
        const nodesArr = Array.from(state.nodes.values());
        for (let i = nodesArr.length - 1; i >= 0; i--) {
            const node = nodesArr[i];
            const nw = node.style?.width || 200;
            const nh = node.style?.height || 150;

            if (flowPos.x >= node.position.x && flowPos.x <= node.position.x + nw &&
                flowPos.y >= node.position.y && flowPos.y <= node.position.y + nh) {
                hitNodeId = node.id;
                break;
            }
        }

        if (hitNodeId) {
            const node = state.nodes.get(hitNodeId);
            if (node && (this.stateManager as any).onNodeContextMenu) {
                (this.stateManager as any).onNodeContextMenu(e, node);
            }
            return;
        }

        // 2. Check if clicked on an Edge
        let hitEdgeId: string | null = null;
        
        // 1. FAST NATIVE PATH
        const targetEl = e.target as Element;
        const edgePathEl = targetEl.closest('.sci-flow-edge-bg, .sci-flow-edge-fg');
        if (edgePathEl && edgePathEl.parentElement && edgePathEl.parentElement.id.startsWith('edge-group-')) {
            hitEdgeId = edgePathEl.parentElement.id.substring('edge-group-'.length);
        }

        // 2. MATHEMATICAL FALLBACK
        if (!hitEdgeId) {
            const HIT_TOLERANCE = 15 / Math.max(0.1, state.viewport.zoom);

            for (const edge of state.edges.values()) {
                const sourceNode = state.nodes.get(edge.source);
                const targetNode = state.nodes.get(edge.target);
                if (!sourceNode || !targetNode) continue;

                const sW = sourceNode.style?.width || 100;
                const sH = sourceNode.style?.height || 50;
                const tH = targetNode.style?.height || 50;

                const sourcePos = {
                   x: sourceNode.position.x + sW,
                   y: sourceNode.position.y + sH / 2
                };
                
                const targetPos = {
                   x: targetNode.position.x,
                   y: targetNode.position.y + tH / 2
                };

                let dist = Infinity;
                if (edge.type === 'straight') {
                    dist = distanceToLineSegment(flowPos, sourcePos, targetPos);
                } else {
                    dist = distanceToBezier(flowPos, sourcePos, targetPos);
                }
                
                if (dist < HIT_TOLERANCE) {
                    hitEdgeId = edge.id;
                    break;
                }
            }
        }

        if (hitEdgeId) {
            const edge = state.edges.get(hitEdgeId);
            if (edge && (this.stateManager as any).onEdgeContextMenu) {
                (this.stateManager as any).onEdgeContextMenu(e, edge);
            }
            return;
        }

        // 3. Background/Pane context menu
        if ((this.stateManager as any).onPaneContextMenu) {
             (this.stateManager as any).onPaneContextMenu(e);
        }
    }

    private isSpacePressed = false;

    private handleKeyDown(e: KeyboardEvent) {
        // Do not intercept if typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        const state = this.stateManager.getState();

        // 1. Space Pan
        if (e.code === 'Space' && !this.isSpacePressed) {
            e.preventDefault();
            this.isSpacePressed = true;
            this.container.style.cursor = 'grab';
        }

        // 2. Select All (Ctrl+A or Cmd+A)
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            const allNodeIds = Array.from(state.nodes.keys());
            this.stateManager.setSelection(allNodeIds, []);
            return;
        }

        // 3. Delete / Backspace
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            const selectedNodes = Array.from(state.nodes.values()).filter(n => n.selected).map(n => n.id);
            const selectedEdges = Array.from(state.edges.values()).filter(e => e.selected).map(e => e.id);
            
            selectedNodes.forEach(id => this.stateManager.removeNode(id));
            selectedEdges.forEach(id => this.stateManager.removeEdge(id));
            return;
        }

        // 4. Arrow Nudging
        const nudgeAmount = e.shiftKey ? 10 : 1;
        let dx = 0; let dy = 0;
        if (e.key === 'ArrowUp') dy = -nudgeAmount;
        else if (e.key === 'ArrowDown') dy = nudgeAmount;
        else if (e.key === 'ArrowLeft') dx = -nudgeAmount;
        else if (e.key === 'ArrowRight') dx = nudgeAmount;

        if (dx !== 0 || dy !== 0) {
            e.preventDefault();
            const selectedNodes = Array.from(state.nodes.values()).filter(n => n.selected);
            selectedNodes.forEach(node => {
                this.stateManager.updateNodePosition(node.id, node.position.x + dx, node.position.y + dy);
            });
            this.stateManager.saveSnapshot();
        }

        // 5. Undo / Redo
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const isRedo = (isMac && e.metaKey && e.shiftKey && e.code === 'KeyZ') || (!isMac && e.ctrlKey && e.code === 'KeyY');
        const isUndo = (e.metaKey || e.ctrlKey) && e.code === 'KeyZ' && !isRedo;

        if (isUndo) {
            e.preventDefault();
            this.stateManager.undo();
        } else if (isRedo) {
            e.preventDefault();
            this.stateManager.redo();
        }
    }

    private handleKeyUp(e: KeyboardEvent) {
        if (e.code === 'Space') {
            this.isSpacePressed = false;
            if (!this.isPanning) {
                this.container.style.cursor = 'default';
            }
        }
    }

    private handleCopy(e: ClipboardEvent) {
        // Do not intercept if typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        const state = this.stateManager.getState();
        const selectedNodes = Array.from(state.nodes.values()).filter(n => n.selected);
        const selectedEdges = Array.from(state.edges.values()).filter(e => e.selected);

        if (selectedNodes.length === 0) return;

        const clipboardData = {
            version: 'sci-flow-1.0',
            nodes: selectedNodes,
            edges: selectedEdges
        };

        if (e.clipboardData) {
            e.clipboardData.setData('application/json', JSON.stringify(clipboardData));
            e.preventDefault();
        }
    }

    private handlePaste(e: ClipboardEvent) {
        // Do not intercept if typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        if (!e.clipboardData) return;
        
        try {
            const dataStr = e.clipboardData.getData('application/json');
            if (!dataStr) return;

            const data = JSON.parse(dataStr);
            if (data.version !== 'sci-flow-1.0' || !Array.isArray(data.nodes)) return;

            e.preventDefault();

            const state = this.stateManager.getState();
            
            // Map old IDs to new IDs to rewire edges
            const idMap = new Map<string, string>();
            
            // Offset for visual paste
            const pasteOffset = 30;

            const newNodes = data.nodes.map((n: any) => {
                const newId = generateId();
                idMap.set(n.id, newId);
                
                return {
                    ...n,
                    id: newId,
                    position: {
                        x: n.position.x + pasteOffset,
                        y: n.position.y + pasteOffset
                    },
                    selected: true // Auto-select pasted nodes
                };
            });

            // Second pass: rewire parentIds inside the pasted group
            newNodes.forEach((n: any) => {
                if (n.parentId) {
                    if (idMap.has(n.parentId)) {
                        n.parentId = idMap.get(n.parentId);
                    } else {
                        // If parent was not selected/copied, the pasted node becomes a root
                        delete n.parentId;
                    }
                }
            });

            const newEdges: any[] = [];
            if (Array.isArray(data.edges)) {
                data.edges.forEach((e: any) => {
                    // Only paste edge if BOTH source and target were copied
                    if (idMap.has(e.source) && idMap.has(e.target)) {
                        newEdges.push({
                            ...e,
                            id: generateId(),
                            source: idMap.get(e.source)!,
                            target: idMap.get(e.target)!,
                            selected: true
                        });
                    }
                });
            }

            // Deselect everything currently on canvas
            this.stateManager.setSelection([], []);
            
            // Insert new nodes and edges
            const currentNodes = Array.from(state.nodes.values());
            const currentEdges = Array.from(state.edges.values());

            this.stateManager.setNodes([...currentNodes, ...newNodes]);
            this.stateManager.setEdges([...currentEdges, ...newEdges]);
            
            // Set Selection to the newly pasted items
            this.stateManager.setSelection(newNodes.map((n: any) => n.id), newEdges.map((e: any) => e.id));
            
            this.stateManager.saveSnapshot();

        } catch(err) {
            // Not parsing valid JSON clipboard data, just ignore
        }
    }

    private screenToFlow(screenPos: Position, viewport: any, rect: DOMRect): Position {
        return {
            x: (screenPos.x - rect.left - viewport.x) / viewport.zoom,
            y: (screenPos.y - rect.top - viewport.y) / viewport.zoom
        };
    }

    public destroy() {
        this.cleanupEvents.forEach(cleanup => cleanup());
    }
}
