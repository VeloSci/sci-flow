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
        
        this.highlightValidPorts();
    }

    private highlightValidPorts(): void {
        if (!this.draftSourceNodeId || !this.draftSourcePortId) return;

        const allPorts = this.container.querySelectorAll('.sci-flow-port');
        const sourcePort = Array.from(allPorts).find(p => (p as HTMLElement).dataset.nodeid === this.draftSourceNodeId && (p as HTMLElement).dataset.portid === this.draftSourcePortId) as HTMLElement;
        const sourceDataType = sourcePort?.dataset.dataType || 'any';
        const sourcePortType = sourcePort?.dataset.portType; // 'in' or 'out'

        allPorts.forEach(p => {
            const port = p as HTMLElement;
            const targetNodeId = port.dataset.nodeid;
            const targetPortId = port.dataset.portid;
            const targetDataType = port.dataset.dataType || 'any';
            const targetPortType = port.dataset.portType;

            // Same port
            if (targetNodeId === this.draftSourceNodeId && targetPortId === this.draftSourcePortId) {
                port.classList.add('sci-flow-port-target-valid');
                return;
            }

            // Validation logic:
            // 1. Different nodes (Self-connections are forbidden in this engine)
            // 2. Different types (in -> out or out -> in)
            // 3. Compatible data types
            const isDifferentNode = targetNodeId !== this.draftSourceNodeId;
            const isDirectionValid = sourcePortType !== targetPortType;
            const isDataTypeValid = sourceDataType === 'any' || targetDataType === 'any' || sourceDataType === targetDataType;

            if (isDifferentNode && isDirectionValid && isDataTypeValid) {
                port.classList.add('sci-flow-port-target-valid');
            } else {
                port.classList.add('sci-flow-port-target-invalid');
            }
        });
    }

    private clearPortHighlights(): void {
        const allPorts = this.container.querySelectorAll('.sci-flow-port');
        allPorts.forEach(p => {
            p.classList.remove('sci-flow-port-target-valid', 'sci-flow-port-target-invalid');
        });
    }

    public updateDraft(flowPos: Position): void {
        if (!this.draftSourceNodeId || !this.draftSourcePortId) return;
        this.stateManager.setDraftEdge(this.draftSourceNodeId, this.draftSourcePortId, flowPos);
    }

    public endDraft(e: PointerEvent): void {
        if (!this.draftSourceNodeId || !this.draftSourcePortId) return;

        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        const portEl = elements.find(el => (el as HTMLElement).closest('.sci-flow-port')) as HTMLElement | undefined;
        const port = portEl?.closest('.sci-flow-port') as HTMLElement | undefined;
        
        if (port && port.dataset.nodeid && port.dataset.portid) {
            const isValid = port.classList.contains('sci-flow-port-target-valid');
            const targetNodeId = port.dataset.nodeid;
            const targetPortId = port.dataset.portid;

            if (isValid && targetNodeId !== this.draftSourceNodeId) {
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

        this.draftSourceNodeId = null;
        this.draftSourcePortId = null;
        this.stateManager.clearDraftEdge();
        this.container.classList.remove('sci-flow-dragging-edge');
        this.clearPortHighlights();
    }

    public isDrafting(): boolean {
        return !!this.draftSourceNodeId;
    }
}
