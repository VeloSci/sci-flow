import { Node } from '../types';
import { StateManager } from '../state/StateManager';
import { NodeDefinition } from '../state/RegistryManager';

export class NodeManager {
    constructor(
        private nodesGroup: SVGGElement
    ) { }

    public reconcile(
        nodes: Map<string, Node>,
        existingNodeDocs: Set<string>,
        stateManager: StateManager | undefined,
        registry: Map<string, NodeDefinition>,
        direction: 'horizontal' | 'vertical' = 'horizontal'
    ): void {
        nodes.forEach(node => {
            let g = document.getElementById(`node-${node.id}`) as SVGGElement | null;
            if (!g) {
                g = this.createNodeElement(node, stateManager, registry, direction);
                this.nodesGroup.appendChild(g);
                if (stateManager?.onNodeMount) {
                    const wrapper = g.querySelector('.sci-flow-node-wrapper') as HTMLDivElement;
                    const bodyArea = g.querySelector('.sci-flow-node-body') as HTMLDivElement;
                    stateManager.onNodeMount(node.id, bodyArea || wrapper);
                }
            } else {
                // Check if node type changed or direction changed
                const wrapper = g.querySelector('.sci-flow-node-wrapper') as HTMLDivElement;
                const nodeDef = registry.get(node.type);
                const isDefaultPreview = wrapper?.dataset.isDefaultPreview === 'true';
                const currentDirection = wrapper?.dataset.direction || 'horizontal';

                if (wrapper && (
                    wrapper.dataset.type !== node.type ||
                    (isDefaultPreview && nodeDef) ||
                    currentDirection !== direction
                )) {
                    this.nodesGroup.removeChild(g);
                    g = this.createNodeElement(node, stateManager, registry, direction);
                    this.nodesGroup.appendChild(g);
                    if (stateManager?.onNodeMount) {
                        const newWrapper = g.querySelector('.sci-flow-node-wrapper') as HTMLDivElement;
                        const newBodyArea = g.querySelector('.sci-flow-node-body') as HTMLDivElement;
                        stateManager.onNodeMount(node.id, newBodyArea || newWrapper);
                    }
                }
            }

            g.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);

            if (node.selected) {
                g.classList.add('sci-flow-node-selected');
            } else {
                g.classList.remove('sci-flow-node-selected');
            }

            // Port Highlighting
            const highlighted = stateManager?.getState().highlightedConnection;
            const ports = g.querySelectorAll('.sci-flow-port') as NodeListOf<SVGCircleElement>;

            let hasPeerConnection = false;

            ports.forEach(p => {
                const portId = p.dataset.portid;
                const isSelected = highlighted && highlighted.nodeId === node.id && highlighted.portId === portId;

                // For "peer" ports: find if this port is at the other end of any edge connected to the highlighted port
                let isPeer = false;
                if (highlighted && !isSelected) {
                    const edges = stateManager?.getState().edges;
                    edges?.forEach(e => {
                        if (e.source === highlighted.nodeId && e.sourceHandle === highlighted.portId) {
                            if (e.target === node.id && e.targetHandle === portId) {
                                isPeer = true;
                                hasPeerConnection = true;
                            }
                        } else if (e.target === highlighted.nodeId && e.targetHandle === highlighted.portId) {
                            if (e.source === node.id && e.sourceHandle === portId) {
                                isPeer = true;
                                hasPeerConnection = true;
                            }
                        }
                    });
                }

                // For "compatible" ports: same data type but not currently connected
                let isCompatible = false;
                if (highlighted && !isSelected && !isPeer && portId) {
                    const sourceNode = stateManager.getState().nodes.get(highlighted.nodeId);
                    const sourcePort = highlighted.type === 'input' ? sourceNode?.inputs?.[highlighted.portId] : sourceNode?.outputs?.[highlighted.portId];
                    const targetPort = p.dataset.portType === 'in' ? node.inputs?.[portId] : node.outputs?.[portId];

                    if (sourcePort && targetPort && p.dataset.portType !== (highlighted.type === 'input' ? 'in' : 'out')) {
                        // Compatibility: matching types or either is 'any'
                        isCompatible = sourcePort.dataType === 'any' || targetPort.dataType === 'any' || sourcePort.dataType === targetPort.dataType;
                    }
                }

                if (isSelected) {
                    p.classList.add('sci-flow-port-selected');
                    p.classList.remove('sci-flow-port-peer', 'sci-flow-port-compatible');
                } else if (isPeer) {
                    p.classList.add('sci-flow-port-peer');
                    p.classList.remove('sci-flow-port-selected', 'sci-flow-port-compatible');
                } else if (isCompatible) {
                    p.classList.add('sci-flow-port-compatible');
                    p.classList.remove('sci-flow-port-selected', 'sci-flow-port-peer');
                } else {
                    p.classList.remove('sci-flow-port-selected', 'sci-flow-port-peer', 'sci-flow-port-compatible');
                }
            });

            // Highlight node if it's a peer
            if (hasPeerConnection) {
                g.classList.add('sci-flow-node-peer');
            } else {
                g.classList.remove('sci-flow-node-peer');
            }

            existingNodeDocs.delete(`node-${node.id}`);
        });

        // Reorder DOM to bring selected nodes to the front (highest z-index)
        // while preserving the original insertion order for unselected nodes.
        const unselectedGroups: SVGGElement[] = [];
        const selectedGroups: SVGGElement[] = [];

        nodes.forEach(node => {
            const g = document.getElementById(`node-${node.id}`) as SVGGElement | null;
            if (g) {
                if (node.selected) selectedGroups.push(g);
                else unselectedGroups.push(g);
            }
        });

        const orderedGroups = [...unselectedGroups, ...selectedGroups];
        orderedGroups.forEach((g, index) => {
            const currentAtPos = this.nodesGroup.children[index];
            if (currentAtPos !== g) {
                this.nodesGroup.insertBefore(g, currentAtPos || null);
            }
        });
    }

    private createNodeElement(
        node: Node,
        stateManager: StateManager | undefined,
        registry: Map<string, NodeDefinition>,
        direction: 'horizontal' | 'vertical'
    ): SVGGElement {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.id = `node-${node.id}`;
        g.setAttribute('class', `sci-flow-node${direction === 'vertical' ? ' sci-flow-vertical' : ''}`);

        const foreignObj = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        const initialWidth = node.style?.width || 140;
        const initialHeight = node.style?.height || 100;
        foreignObj.setAttribute('width', initialWidth.toString());
        foreignObj.setAttribute('height', initialHeight.toString());
        foreignObj.style.overflow = 'visible';

        const wrapper = document.createElement('div');
        wrapper.className = 'sci-flow-node-wrapper';
        wrapper.dataset.type = node.type;
        wrapper.dataset.direction = direction;

        // Essential: Track if this is a default preview to allow later replacement
        const nodeDef = registry.get(node.type);
        wrapper.dataset.isDefaultPreview = nodeDef ? 'false' : 'true';

        const inputIds = Object.keys(node.inputs || {});
        const outputIds = Object.keys(node.outputs || {});
        const headerHeight = 32;
        const portSpacing = 26;

        const isVertical = direction === 'vertical';

        // Initialize Structure
        wrapper.innerHTML = `
            <div class="sci-flow-node-header">
                <strong>${nodeDef ? (node.data?.title || node.type) : node.type}</strong>
                <span class="sci-flow-node-id">${node.id.slice(0, 4)}</span>
            </div>
            <div class="sci-flow-node-main">
                <div class="sci-flow-node-body"></div>
                <div class="sci-flow-node-ports-area"></div>
                <div class="sci-flow-node-actions"></div>
            </div>
        `;

        const bodyArea = wrapper.querySelector('.sci-flow-node-body') as HTMLDivElement;
        const portsArea = wrapper.querySelector('.sci-flow-node-ports-area') as HTMLDivElement;

        // Populate Body
        if (nodeDef?.renderHTML) {
            bodyArea.appendChild(nodeDef.renderHTML(node));
        } else if (!nodeDef) {
            bodyArea.innerHTML = `<div class="sci-flow-node-fallback">Default Node Content</div>`;
        }

        // Reserve space for ports — in vertical mode hide the ports area labels
        if (isVertical) {
            portsArea.style.display = 'none';
        } else {
            const portCount = Math.max(inputIds.length, outputIds.length);
            if (portCount > 0) {
                portsArea.style.height = `${portCount * 26}px`;
                portsArea.style.minHeight = '20px';
            } else {
                portsArea.style.display = 'none';
            }
        }

        // Essential: Append foreignObject FIRST so it is under labels/ports
        foreignObj.appendChild(wrapper);
        g.appendChild(foreignObj);

        const createSVGPort = (id: string, type: 'in' | 'out', dataType: string) => {
            const port = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            port.setAttribute('class', `sci-flow-port`);
            port.setAttribute('r', '5');
            port.dataset.nodeid = node.id;
            port.dataset.portid = id;
            port.dataset.portType = type;
            port.dataset.dataType = dataType;
            g.appendChild(port);
            return port;
        };

        // Create ports — position depends on direction
        const inPorts = inputIds.map((id, i) => {
            const port = createSVGPort(id, 'in', node.inputs[id]?.dataType || 'any');
            if (isVertical) {
                // Top edge, spread horizontally
                const spacing = initialWidth / (inputIds.length + 1);
                port.setAttribute('cx', String(spacing * (i + 1)));
                port.setAttribute('cy', '-6');
            } else {
                const y = headerHeight + 60 + 13 + (i * portSpacing);
                port.setAttribute('cy', y.toString());
                port.setAttribute('cx', '-6');
            }
            return port;
        });
        const outPorts = outputIds.map((id, i) => {
            const port = createSVGPort(id, 'out', node.outputs[id]?.dataType || 'any');
            if (isVertical) {
                // Bottom edge, spread horizontally
                const spacing = initialWidth / (outputIds.length + 1);
                port.setAttribute('cx', String(spacing * (i + 1)));
                port.setAttribute('cy', String(initialHeight + 6));
            } else {
                const y = headerHeight + 60 + 13 + (i * portSpacing);
                port.setAttribute('cy', y.toString());
                port.setAttribute('cx', String(initialWidth + 6));
            }
            return port;
        });

        let rafId: number;
        let isFirstResize = true;
        const ro = new ResizeObserver(() => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const w = wrapper.offsetWidth;
                const h = wrapper.offsetHeight;
                if (w === 0 || h === 0) return;

                foreignObj.setAttribute('width', w.toString());
                foreignObj.setAttribute('height', h.toString());

                // Sync state if dimensions changed
                const stateNode = stateManager?.getState().nodes.get(node.id);
                // Also trigger an update if it's the first resize so edges connect perfectly to the updated SVG layout
                const sizeChanged = stateNode && (Math.abs((stateNode.style?.width || 0) - w) > 1 || Math.abs((stateNode.style?.height || 0) - h) > 1);

                let needsUpdate = false;
                if (sizeChanged) {
                    stateNode.style = { ...stateNode.style, width: w, height: h };
                    needsUpdate = true;
                }
                if (isFirstResize) {
                    needsUpdate = true;
                    isFirstResize = false;
                }

                if (isVertical) {
                    // Vertical: inputs on top, outputs on bottom, spread horizontally
                    inPorts.forEach((p, i) => {
                        const spacing = w / (inputIds.length + 1);
                        p.setAttribute('cx', String(spacing * (i + 1)));
                        p.setAttribute('cy', '-6');
                    });

                    outPorts.forEach((p, i) => {
                        const spacing = w / (outputIds.length + 1);
                        p.setAttribute('cx', String(spacing * (i + 1)));
                        p.setAttribute('cy', String(h + 6));
                    });

                    // No labels in vertical mode
                } else {
                    // Horizontal: existing left-right behavior
                    const portsAreaEl = wrapper.querySelector('.sci-flow-node-ports-area') as HTMLDivElement;
                    const portsYOffset = portsAreaEl ? (portsAreaEl.offsetTop) : headerHeight;

                    inPorts.forEach((p, i) => {
                        const y = portsYOffset + 13 + (i * portSpacing);
                        p.setAttribute('cy', y.toString());
                        p.setAttribute('cx', '-6');

                        const labelId = `label-in-${node.id}-${inputIds[i]}`;
                        let label = document.getElementById(labelId) as SVGTextElement | null;
                        if (!label) {
                            label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                            label.id = labelId;
                            label.setAttribute('class', 'sci-flow-port-label');
                            label.setAttribute('x', '12');
                            label.style.pointerEvents = 'none';
                            g.appendChild(label);
                        }
                        if (label) {
                            label.setAttribute('y', (y + 4).toString());
                            label.textContent = node.inputs[inputIds[i]]?.label || inputIds[i];
                        }
                    });

                    outPorts.forEach((p, i) => {
                        const y = portsYOffset + 13 + (i * portSpacing);
                        p.setAttribute('cy', y.toString());
                        p.setAttribute('cx', String(w + 6));

                        const labelId = `label-out-${node.id}-${outputIds[i]}`;
                        let label = document.getElementById(labelId) as SVGTextElement | null;
                        if (!label) {
                            label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                            label.id = labelId;
                            label.setAttribute('class', 'sci-flow-port-label');
                            label.setAttribute('text-anchor', 'end');
                            label.style.pointerEvents = 'none';
                            g.appendChild(label);
                        }
                        if (label) {
                            label.setAttribute('x', (w - 12).toString());
                            label.setAttribute('y', (y + 4).toString());
                            label.textContent = node.outputs[outputIds[i]]?.label || outputIds[i];
                        }
                    });
                }

                // Notify state manager ONLY after DOM is updated and correct
                const isFirstLayout = !wrapper.dataset.layoutSettled;
                if ((isFirstLayout || sizeChanged || needsUpdate) && stateManager) {
                    wrapper.dataset.layoutSettled = 'true';
                    stateManager.forceUpdate();
                }
            });
        });
        ro.observe(wrapper);

        return g;
    }
}
