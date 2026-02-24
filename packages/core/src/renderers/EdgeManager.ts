import { Edge, FlowState, Node, Position } from '../types';
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
        private getPortAnchorFn: (node: Node, portId: string) => Position
    ) {}

    public reconcile(state: FlowState, existingEdgeDocs: Set<string>, obstacles: Array<{ id: string, x: number, y: number, width: number, height: number }>): void {

        state.edges.forEach(edge => {
            const sourceNode = state.nodes.get(edge.source);
            const targetNode = state.nodes.get(edge.target);

            if (!sourceNode || !targetNode) return;

            const sourcePos = this.getPortAnchorFn(sourceNode, edge.sourceHandle);
            const targetPos = this.getPortAnchorFn(targetNode, edge.targetHandle);

            const routingMode = edge.type || 'bezier';
            let group = document.getElementById(`edge-group-${edge.id}`) as SVGGElement | null;
            
            if (!group) {
                group = this.createEdgeElement(edge);
                this.edgesGroup.appendChild(group);
            }

            // Filter obstacles to exclude source and target nodes to avoid blocking the path start/end
            const filteredObstacles = obstacles.filter(obs => obs.id !== edge.source && obs.id !== edge.target);

            this.updateEdgeVisuals(group, edge, sourcePos, targetPos, routingMode, filteredObstacles);
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
        fgPath.id = `edge-path-${edge.id}`;
        fgPath.setAttribute('class', 'sci-flow-edge-fg');
        fgPath.setAttribute('fill', 'none');
        fgPath.style.pointerEvents = 'none';

        const overlayPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        overlayPath.setAttribute('class', 'sci-flow-edge-overlay');
        overlayPath.setAttribute('fill', 'none');
        overlayPath.style.pointerEvents = 'none';
        overlayPath.style.display = 'none';

        const symbolsText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        symbolsText.setAttribute('class', 'sci-flow-edge-symbols');
        symbolsText.style.display = 'none';
        symbolsText.style.pointerEvents = 'none';
        
        const textPath = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
        textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#edge-path-${edge.id}`);
        textPath.setAttribute('startOffset', '0%');
        textPath.textContent = '» » » » » » » » » » » » » » » » » » » »';
        symbolsText.appendChild(textPath);
        
        const sourcePort = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        sourcePort.setAttribute('class', 'sci-flow-port-source');
        sourcePort.setAttribute('r', '3');
        sourcePort.style.pointerEvents = 'none';
        
        const targetPort = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        targetPort.setAttribute('class', 'sci-flow-port-target');
        targetPort.setAttribute('r', '3');
        targetPort.style.pointerEvents = 'none';

        group.appendChild(bgPath);
        group.appendChild(fgPath);
        group.appendChild(overlayPath);
        group.appendChild(symbolsText);
        group.appendChild(sourcePort);
        group.appendChild(targetPort);
        
        return group;
    }
    private updateEdgeVisuals(group: SVGGElement, edge: Edge, sourcePos: Position, targetPos: Position, routingMode: NonNullable<Edge['type']>, obstacles: Array<{ id: string, x: number, y: number, width: number, height: number }>): void {
        const bgPath = group.querySelector('.sci-flow-edge-bg') as SVGPathElement;
        const fgPath = group.querySelector('.sci-flow-edge-fg') as SVGPathElement;
        const overlayPath = group.querySelector('.sci-flow-edge-overlay') as SVGPathElement;
        const symbolsText = group.querySelector('.sci-flow-edge-symbols') as SVGTextElement;
        const sourcePort = group.querySelector('.sci-flow-port-source') as SVGCircleElement;
        const targetPort = group.querySelector('.sci-flow-port-target') as SVGCircleElement;

        [sourcePort, targetPort].forEach(p => {
            p.style.fill = 'var(--sf-bg)';
            p.style.stroke = edge.selected ? 'var(--sf-edge-active)' : 'var(--sf-edge-line)';
            p.style.strokeWidth = '1.5px';
            p.style.opacity = '0.6';
        });

        sourcePort.setAttribute('cx', `${sourcePos.x}`);
        sourcePort.setAttribute('cy', `${sourcePos.y}`);
        targetPort.setAttribute('cx', `${targetPos.x}`);
        targetPort.setAttribute('cy', `${targetPos.y}`);

        // Apply custom styles if present
        const customLineStyle = edge.style?.lineStyle || 'solid';
        const customStroke = edge.style?.stroke;
        const customStrokeWidth = edge.style?.strokeWidth;
        const animType = edge.style?.animationType || 'dash';

        fgPath.style.stroke = customStroke || (edge.selected ? 'var(--sf-edge-active)' : 'var(--sf-edge-line)');
        fgPath.style.strokeWidth = customStrokeWidth ? `${customStrokeWidth}px` : (edge.selected ? '3px' : '2px');
        
        fgPath.classList.remove('sci-flow-edge-animated-pulse', 'sci-flow-edge-animated-arrows', 'sci-flow-edge-animated-symbols');
        overlayPath.style.display = 'none';
        if (symbolsText) {
            symbolsText.style.display = 'none';
            symbolsText.setAttribute('dominant-baseline', 'middle');
            symbolsText.setAttribute('alignment-baseline', 'middle');
        }
        
        fgPath.style.animation = '';

        if (edge.animated) {
            if (animType === 'pulse') {
                fgPath.classList.add('sci-flow-edge-animated-pulse');
                fgPath.style.strokeDasharray = 'none';
            } else if (animType === 'arrows') {
                fgPath.classList.add('sci-flow-edge-animated-arrows');
            } else if (animType === 'symbols') {
                if (symbolsText) {
                    symbolsText.style.display = 'block';
                    symbolsText.style.fill = customStroke || (edge.selected ? 'var(--sf-edge-active)' : 'var(--sf-edge-line)');
                    symbolsText.style.fontSize = '12px';
                    symbolsText.style.fontWeight = 'bold';
                    
                    const textPath = symbolsText.querySelector('textPath');
                    if (textPath) {
                        // Clear existing animation elements
                        while (textPath.firstChild) textPath.removeChild(textPath.firstChild);
                        textPath.textContent = '» » » » » » » »'; // Keep it shorter to avoid overlap jumps
                        
                        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                        animate.setAttribute('attributeName', 'startOffset');
                        animate.setAttribute('from', '-20%');
                        animate.setAttribute('to', '100%');
                        animate.setAttribute('dur', '3s');
                        animate.setAttribute('repeatCount', 'indefinite');
                        textPath.appendChild(animate);
                    }
                }
                fgPath.style.strokeDasharray = 'none';
            } else {
                fgPath.style.strokeDasharray = '5, 5';
                fgPath.style.animation = 'sf-dash-anim 1s linear infinite';
            }
        } else {
            fgPath.style.animation = 'none';
            if (customLineStyle === 'dashed') {
                fgPath.style.strokeDasharray = '8, 8';
            } else if (customLineStyle === 'dotted') {
                fgPath.style.strokeDasharray = '2, 4';
            } else {
                fgPath.style.strokeDasharray = 'none';
            }
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
                        const ov = g.querySelector('.sci-flow-edge-overlay') as SVGPathElement;
                        if (bg && fg) {
                            bg.setAttribute('d', finalPath);
                            fg.setAttribute('d', finalPath);
                            if (ov) ov.setAttribute('d', finalPath);
                        }
                    }
                });

                this.routerWorker.postMessage({
                    id: jobId, source: sourcePos, target: targetPos, obstacles: obstacles, padding: 20
                } as PathfindingWorkerMessageData);
            }
        } else {
            const pathString = getEdgePath({ source: sourcePos, target: targetPos, mode: routingMode, obstacles: obstacles });
            setPaths(pathString);
            overlayPath.setAttribute('d', pathString);
            this.routeCache.set(edge.id, pathString);
            this.routingHashCache.set(edge.id, routeHash);
        }
    }
}
