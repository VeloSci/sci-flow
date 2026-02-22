import { Edge, FlowState } from '../types';
import { getEdgePath } from '../utils/edges';
import { PathfindingWorkerMessageData } from '../workers/pathfinding.worker';

export class EdgeManager {
    constructor(
        private edgesGroup: SVGGElement,
        private routerWorker: Worker,
        private routeCache: Map<string, string>,
        private routingHashCache: Map<string, string>,
        private pendingRoutes: Map<string, (path: string) => void>,
        private routerIdCounter: { value: number },
        private getPortAnchorFn: (node: any, portId: string) => { x: number, y: number }
    ) {}

    public reconcile(state: FlowState, existingEdgeDocs: Set<string>, obstacles: any[]): void {

        state.edges.forEach(edge => {
            const sourceNode = state.nodes.get(edge.source);
            const targetNode = state.nodes.get(edge.target);

            if (!sourceNode || !targetNode) return;

            const sourcePos = this.getPortAnchorFn(sourceNode, edge.sourceHandle);
            const targetPos = this.getPortAnchorFn(targetNode, edge.targetHandle);

            const routingMode = (edge.type as any) || 'bezier';
            let group = document.getElementById(`edge-group-${edge.id}`) as SVGGElement | null;
            
            if (!group) {
                group = this.createEdgeElement(edge);
                this.edgesGroup.appendChild(group);
            }

            // Filter obstacles to exclude source and target nodes to avoid blocking the path start/end
            const filteredObstacles = obstacles.filter(obs => obs.id !== edge.source && obs.id !== edge.target);

            this.updateEdgeVisuals(group, edge, sourcePos, targetPos, routingMode as any, filteredObstacles);
            existingEdgeDocs.delete(`edge-group-${edge.id}`);
        });
    }

    private createEdgeElement(edge: Edge): SVGGElement {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.id = `edge-group-${edge.id}`;
        group.setAttribute('class', 'sci-flow-edge-group');
        
        const bgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        bgPath.setAttribute('class', 'sci-flow-edge-bg');
        bgPath.setAttribute('fill', 'none');
        bgPath.style.stroke = 'transparent';
        bgPath.style.strokeWidth = '20px';
        bgPath.style.cursor = 'pointer';
        bgPath.style.pointerEvents = 'stroke';
        
        const fgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        fgPath.setAttribute('class', 'sci-flow-edge-fg');
        fgPath.setAttribute('fill', 'none');
        fgPath.style.pointerEvents = 'none';
        
        const sourcePort = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        sourcePort.setAttribute('class', 'sci-flow-port-source');
        sourcePort.setAttribute('r', '5');
        
        const targetPort = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        targetPort.setAttribute('class', 'sci-flow-port-target');
        targetPort.setAttribute('r', '5');

        group.appendChild(bgPath);
        group.appendChild(fgPath);
        group.appendChild(sourcePort);
        group.appendChild(targetPort);
        
        return group;
    }
    private updateEdgeVisuals(group: SVGGElement, edge: Edge, sourcePos: any, targetPos: any, routingMode: string, obstacles: any[]): void {
        const bgPath = group.querySelector('.sci-flow-edge-bg') as SVGPathElement;
        const fgPath = group.querySelector('.sci-flow-edge-fg') as SVGPathElement;
        const sourcePort = group.querySelector('.sci-flow-port-source') as SVGCircleElement;
        const targetPort = group.querySelector('.sci-flow-port-target') as SVGCircleElement;

        [sourcePort, targetPort].forEach(p => {
            p.style.fill = 'var(--sf-bg)';
            p.style.stroke = edge.selected ? 'var(--sf-edge-active)' : 'var(--sf-edge-line)';
            p.style.strokeWidth = '2px';
        });

        sourcePort.setAttribute('cx', `${sourcePos.x}`);
        sourcePort.setAttribute('cy', `${sourcePos.y}`);
        targetPort.setAttribute('cx', `${targetPos.x}`);
        targetPort.setAttribute('cy', `${targetPos.y}`);

        // Apply custom styles if present
        const customLineStyle = edge.style?.lineStyle || 'solid';
        const customStroke = edge.style?.stroke;
        const customStrokeWidth = edge.style?.strokeWidth;

        fgPath.style.stroke = customStroke || (edge.selected ? 'var(--sf-edge-active)' : 'var(--sf-edge-line)');
        fgPath.style.strokeWidth = customStrokeWidth ? `${customStrokeWidth}px` : (edge.selected ? '3px' : '2px');

        if (edge.animated) {
            fgPath.style.strokeDasharray = '5, 5';
            fgPath.style.animation = 'sf-dash-anim 1s linear infinite';
        } else if (customLineStyle === 'dashed') {
            fgPath.style.strokeDasharray = '8, 8';
            fgPath.style.animation = 'none';
        } else if (customLineStyle === 'dotted') {
            fgPath.style.strokeDasharray = '2, 4';
            fgPath.style.animation = 'none';
        } else {
            fgPath.style.strokeDasharray = 'none';
            fgPath.style.animation = 'none';
        }

        const routeHash = `${sourcePos.x},${sourcePos.y}|${targetPos.x},${targetPos.y}|${routingMode}|${obstacles.length}`;
        const setPaths = (p: string) => {
            bgPath.setAttribute('d', p);
            fgPath.setAttribute('d', p);
        };

        if (routingMode === 'smart') {
            if (this.routeCache.has(edge.id) && this.routingHashCache.get(edge.id) === routeHash) {
                setPaths(this.routeCache.get(edge.id)!);
            } else {
                const tempPath = getEdgePath({ source: sourcePos, target: targetPos, mode: 'step' });
                setPaths(tempPath);

                const jobId = `job-${this.routerIdCounter.value++}`;
                this.pendingRoutes.set(jobId, (finalPath: string) => {
                    this.routeCache.set(edge.id, finalPath);
                    this.routingHashCache.set(edge.id, routeHash);
                    const g = document.getElementById(`edge-group-${edge.id}`);
                    if (g) {
                        const bg = g.querySelector('.sci-flow-edge-bg') as SVGPathElement;
                        const fg = g.querySelector('.sci-flow-edge-fg') as SVGPathElement;
                        if (bg && fg) {
                            bg.setAttribute('d', finalPath);
                            fg.setAttribute('d', finalPath);
                        }
                    }
                });

                this.routerWorker.postMessage({
                    id: jobId, source: sourcePos, target: targetPos, obstacles: obstacles, padding: 20
                } as PathfindingWorkerMessageData);
            }
        } else {
            const pathString = getEdgePath({ source: sourcePos, target: targetPos, mode: routingMode as any, obstacles: obstacles });
            setPaths(pathString);
            this.routeCache.set(edge.id, pathString);
            this.routingHashCache.set(edge.id, routeHash);
        }
    }
}
