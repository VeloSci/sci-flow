import { StateManager } from '../state/StateManager';
import { Position } from '../types';

export class ConnectionManager {
    private draftSourceNodeId: string | null = null;
    private draftSourcePortId: string | null = null;

    constructor(
        private container: HTMLElement,
        private stateManager: StateManager
    ) {}

    public startDraft(nodeId: string, portId: string, pointerId: number): void {
        this.draftSourceNodeId = nodeId;
        this.draftSourcePortId = portId;
        this.container.setPointerCapture(pointerId);
        this.container.classList.add('sci-flow-dragging-edge');
    }

    public updateDraft(flowPos: Position): void {
        if (!this.draftSourceNodeId || !this.draftSourcePortId) return;
        this.stateManager.setDraftEdge(
            this.draftSourceNodeId,
            this.draftSourcePortId,
            flowPos
        );
    }

    public endDraft(e: PointerEvent): void {
        if (!this.draftSourceNodeId || !this.draftSourcePortId) return;

        // Use elementFromPoint because pointer capture makes e.target the container
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        const portEl = elements.find(el => (el as HTMLElement).closest('.sci-flow-port')) as HTMLElement | undefined;
        const port = portEl?.closest('.sci-flow-port') as HTMLElement | undefined;
        
        if (port && port.dataset.nodeid && port.dataset.portid) {
            const targetNodeId = port.dataset.nodeid;
            const targetPortId = port.dataset.portid;

            // Only connect if it's a different node
            if (targetNodeId !== this.draftSourceNodeId) {
                // Directionality validation: in only connects to out, and vice versa
                const isSourceIn = this.draftSourcePortId!.startsWith('in');
                const isTargetIn = targetPortId.startsWith('in');

                if (isSourceIn !== isTargetIn) {
                    const state = this.stateManager.getState();
                    let edgeExists = false;
                    for (const edge of state.edges.values()) {
                        if (edge.source === this.draftSourceNodeId && 
                            edge.target === targetNodeId &&
                            edge.sourceHandle === this.draftSourcePortId &&
                            edge.targetHandle === targetPortId) {
                            edgeExists = true;
                            break;
                        }
                    }

                    if (!edgeExists) {
                        this.stateManager.addEdge({
                            id: `edge-${Date.now()}`,
                            source: this.draftSourceNodeId,
                            sourceHandle: this.draftSourcePortId,
                            target: targetNodeId,
                            targetHandle: targetPortId,
                            type: state.defaultEdgeType,
                            style: state.defaultEdgeStyle ? { ...state.defaultEdgeStyle } : undefined
                        });
                    }
                }
            }
        }

        this.draftSourceNodeId = null;
        this.draftSourcePortId = null;
        this.stateManager.clearDraftEdge();
        this.container.classList.remove('sci-flow-dragging-edge');
    }

    public isDrafting(): boolean {
        return !!this.draftSourceNodeId;
    }
}
