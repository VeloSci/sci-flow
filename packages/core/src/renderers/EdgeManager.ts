import { Edge, FlowState, Node, Position } from '../types';
import { getEdgePath } from '../utils/edges';
import { PathfindingWorkerMessageData } from '../workers/pathfinding.worker';
import {
    injectAnimationStyles,
    resolveAnimationType,
    ANIMATION_CONFIG,
    createAnimationObjects
} from './EdgeAnimations';

export class EdgeManager {
    constructor(
        private edgesGroup: SVGGElement,
        private routerWorker: Worker,
        private routeCache: Map<string, string>,
        private routingHashCache: Map<string, string>,
        private pendingRoutes: Map<string, (path: string) => void>,
        private routerIdCounter: { value: number },
        private getPortAnchorFn: (node: Node, portId: string) => Position
    ) {
        injectAnimationStyles();
    }

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
        fgPath.setAttribute('pathLength', '100');
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

        const beamPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        beamPath.setAttribute('class', 'sci-flow-edge-beam-overlay');
        beamPath.setAttribute('fill', 'none');
        beamPath.style.pointerEvents = 'none';
        beamPath.style.display = 'none';

        // Container for Phase 2 traveling objects (arrows, dots, shapes)
        const animObjsContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        animObjsContainer.setAttribute('class', 'sci-flow-edge-anim-objects');
        animObjsContainer.style.pointerEvents = 'none';

        group.appendChild(bgPath);
        group.appendChild(fgPath);
        group.appendChild(overlayPath);
        group.appendChild(beamPath);
        group.appendChild(symbolsText);
        group.appendChild(animObjsContainer);
        group.appendChild(sourcePort);
        group.appendChild(targetPort);

        return group;
    }


    private updateEdgeVisuals(group: SVGGElement, edge: Edge, sourcePos: Position, targetPos: Position, routingMode: NonNullable<Edge['type']>, obstacles: Array<{ id: string, x: number, y: number, width: number, height: number }>): void {
        const bgPath = group.querySelector('.sci-flow-edge-bg') as SVGPathElement;
        const fgPath = group.querySelector('.sci-flow-edge-fg') as SVGPathElement;
        const overlayPath = group.querySelector('.sci-flow-edge-overlay') as SVGPathElement;
        const beamPath = group.querySelector('.sci-flow-edge-beam-overlay') as SVGPathElement;
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
        const animType = edge.style?.animationType;

        fgPath.style.stroke = customStroke || (edge.selected ? 'var(--sf-edge-active)' : 'var(--sf-edge-line)');
        fgPath.style.strokeWidth = customStrokeWidth ? `${customStrokeWidth}px` : (edge.selected ? '3px' : '2px');

        // ─── CLEAR ALL ANIMATION STATE ───
        fgPath.classList.remove('sci-flow-edge-animated-pulse', 'sci-flow-edge-anim');
        fgPath.style.animation = '';
        fgPath.style.animationName = '';
        fgPath.style.strokeDasharray = '';
        fgPath.style.strokeDashoffset = '';
        fgPath.style.strokeLinecap = '';
        fgPath.style.filter = '';
        fgPath.style.clipPath = '';
        const oldFgAnim = fgPath.querySelector('animate');
        if (oldFgAnim) oldFgAnim.remove();
        overlayPath.style.display = 'none';
        if (beamPath) {
            beamPath.style.display = 'none';
        }
        if (symbolsText) symbolsText.style.display = 'none';

        // Clear Phase 2 traveling objects
        const animObjsContainer = group.querySelector('.sci-flow-edge-anim-objects') as SVGGElement | null;
        if (animObjsContainer) {
            animObjsContainer.innerHTML = '';
        }

        // ─── LINE STYLE (base, always applied) ───
        if (customLineStyle === 'dashed') {
            fgPath.style.strokeDasharray = '8, 8';
        } else if (customLineStyle === 'dotted') {
            fgPath.style.strokeDasharray = '2, 4';
        } else {
            fgPath.style.strokeDasharray = 'none';
        }

        // ─── ANIMATION (config-driven) ───
        const ANIM_DUR = edge.style?.animationDuration || '2s';
        const ANIM_EASING = edge.style?.animationEasing || 'linear';

        if (edge.animated && animType) {
            const resolvedType = resolveAnimationType(animType);
            const config = ANIMATION_CONFIG[resolvedType];

            if (config) {
                if (config.category === 'dash') {
                    // Dash-based: apply CSS animation class + set dasharray
                    if (config.needsPathLength) {
                        fgPath.setAttribute('pathLength', '100');
                    }
                    if (config.dasharray) {
                        fgPath.style.strokeDasharray = config.dasharray;
                    }
                    if (config.linecap) {
                        fgPath.style.strokeLinecap = config.linecap;
                    }
                    fgPath.classList.add('sci-flow-edge-anim');
                    fgPath.style.animationName = config.cssAnimName!;
                    fgPath.style.animationDuration = ANIM_DUR;
                    fgPath.style.animationTimingFunction = ANIM_EASING;

                } else if (config.category === 'css') {
                    // Pure CSS animation (fade, glow, thick-pulse, color-pulse, wipe)
                    fgPath.classList.add('sci-flow-edge-anim');
                    fgPath.style.animationName = config.cssAnimName!;
                    fgPath.style.animationDuration = ANIM_DUR;
                    fgPath.style.animationTimingFunction = ANIM_EASING;

                } else if (config.category === 'object' && animObjsContainer) {
                    // Object-based: create traveling SVG elements with animateMotion
                    const edgePathId = `edge-path-${edge.id}`;
                    const edgeColor = customStroke || 'var(--sf-edge-active)';
                    const animColor = edge.style?.animationColor;
                    const objs = createAnimationObjects(config, edgePathId, edgeColor, ANIM_DUR, animColor);
                    // Move children into the existing container (not replace the container)
                    while (objs.firstChild) {
                        animObjsContainer.appendChild(objs.firstChild);
                    }

                } else if (config.category === 'compound') {
                    // Compound: apply dash part + object part
                    if (config.dashPart) {
                        const dashConfig = ANIMATION_CONFIG[config.dashPart];
                        if (dashConfig) {
                            if (dashConfig.needsPathLength) {
                                fgPath.setAttribute('pathLength', '100');
                            }
                            if (dashConfig.dasharray) {
                                fgPath.style.strokeDasharray = dashConfig.dasharray;
                            }
                            if (dashConfig.linecap) {
                                fgPath.style.strokeLinecap = dashConfig.linecap;
                            }
                            fgPath.classList.add('sci-flow-edge-anim');
                            fgPath.style.animationName = dashConfig.cssAnimName!;
                            fgPath.style.animationDuration = ANIM_DUR;
                            fgPath.style.animationTimingFunction = ANIM_EASING;
                        }
                    }
                    if (config.objectPart && animObjsContainer) {
                        const objConfig = ANIMATION_CONFIG[config.objectPart];
                        if (objConfig) {
                            const edgePathId = `edge-path-${edge.id}`;
                            const edgeColor = customStroke || 'var(--sf-edge-active)';
                            const animColor = edge.style?.animationColor;
                            const objs = createAnimationObjects(objConfig, edgePathId, edgeColor, ANIM_DUR, animColor);
                            while (objs.firstChild) {
                                animObjsContainer.appendChild(objs.firstChild);
                            }
                        }
                    }
                }
            }
        }

        // ─── PATH COMPUTATION ───
        const routeHash = `${sourcePos.x},${sourcePos.y}|${targetPos.x},${targetPos.y}|${routingMode}|${obstacles.length}`;

        const setPaths = (p: string) => {
            bgPath.setAttribute('d', p);
            fgPath.setAttribute('d', p);
            overlayPath.setAttribute('d', p);
            if (beamPath) {
                beamPath.setAttribute('d', p);
            }
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
                        const bm = g.querySelector('.sci-flow-edge-beam-overlay') as SVGPathElement;
                        if (bg && fg) {
                            bg.setAttribute('d', finalPath);
                            fg.setAttribute('d', finalPath);
                            if (ov) ov.setAttribute('d', finalPath);
                            if (bm) {
                                bm.setAttribute('d', finalPath);
                            }
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
            this.routeCache.set(edge.id, pathString);
            this.routingHashCache.set(edge.id, routeHash);
        }
    }
}
