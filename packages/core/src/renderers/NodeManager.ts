import { Node } from '../types';

export class NodeManager {
    constructor(
        private nodesGroup: SVGGElement
    ) {}

    public reconcile(
        nodes: Map<string, Node>, 
        existingNodeDocs: Set<string>, 
        stateManager: any, 
        registry: Map<string, any>
    ): void {
        nodes.forEach(node => {
            let g = document.getElementById(`node-${node.id}`) as SVGGElement | null;
            if (!g) {
                g = this.createNodeElement(node, stateManager, registry);
                this.nodesGroup.appendChild(g);
                if (stateManager?.onNodeMount) {
                    const wrapper = g.querySelector('.sci-flow-node-wrapper') as HTMLDivElement;
                    const bodyArea = g.querySelector('.sci-flow-node-body') as HTMLDivElement;
                    stateManager.onNodeMount(node.id, bodyArea || wrapper);
                }
            } else {
                // Check if node type changed or if we need to swap default preview for real component
                const wrapper = g.querySelector('.sci-flow-node-wrapper') as HTMLDivElement;
                const nodeDef = registry.get(node.type);
                const isDefaultPreview = wrapper?.dataset.isDefaultPreview === 'true';
                
                // Only re-render if:
                // 1. The type has fundamentally changed
                // 2. We were showing a placeholder and now we have a real HTML component
                // 3. We were showing a placeholder for a React node that is now registered
                if (wrapper && (
                    wrapper.dataset.type !== node.type || 
                    (isDefaultPreview && nodeDef)
                )) {
                    this.nodesGroup.removeChild(g);
                    g = this.createNodeElement(node, stateManager, registry);
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
            
            existingNodeDocs.delete(`node-${node.id}`);
        });
    }

    private createNodeElement(node: Node, stateManager: any, registry: Map<string, any>): SVGGElement {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.id = `node-${node.id}`;
        g.setAttribute('class', 'sci-flow-node');
        
        const foreignObj = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        const initialWidth = node.style?.width || 140;
        const initialHeight = node.style?.height || 100;
        foreignObj.setAttribute('width', initialWidth.toString());
        foreignObj.setAttribute('height', initialHeight.toString());
        foreignObj.style.overflow = 'visible';

        const wrapper = document.createElement('div');
        wrapper.className = 'sci-flow-node-wrapper';
        wrapper.dataset.type = node.type;
        
        // Essential: Track if this is a default preview to allow later replacement
        const nodeDef = registry.get(node.type);
        wrapper.dataset.isDefaultPreview = nodeDef ? 'false' : 'true';

        const inputIds = Object.keys(node.inputs || {});
        const outputIds = Object.keys(node.outputs || {});
        const headerHeight = 32;
        const portSpacing = 26;

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

        // Reserve space for ports
        const portCount = Math.max(inputIds.length, outputIds.length);
        if (portCount > 0) {
            portsArea.style.height = `${portCount * 26}px`;
            portsArea.style.minHeight = '20px';
        } else {
            portsArea.style.display = 'none';
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
            g.appendChild(port); // Append after foreignObj
            return port;
        };

        const inPorts = inputIds.map((id, i) => {
            const port = createSVGPort(id, 'in', node.inputs[id]?.dataType || 'any');
            // Constant Sync: header (32) + estimated body (60) + 13 center
            const y = headerHeight + 60 + 13 + (i * portSpacing);
            port.setAttribute('cy', y.toString());
            port.setAttribute('cx', '-6');
            return port;
        });
        const outPorts = outputIds.map((id, i) => {
            const port = createSVGPort(id, 'out', node.outputs[id]?.dataType || 'any');
            const y = headerHeight + 60 + 13 + (i * portSpacing);
            port.setAttribute('cy', y.toString());
            port.setAttribute('cx', String(initialWidth + 6));
            return port;
        });

        let rafId: number;
        const ro = new ResizeObserver(() => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const w = wrapper.offsetWidth;
                const h = wrapper.offsetHeight;
                if (w === 0 || h === 0) return;

                foreignObj.setAttribute('width', w.toString());
                foreignObj.setAttribute('height', h.toString());

                const portsArea = wrapper.querySelector('.sci-flow-node-ports-area') as HTMLDivElement;
                const portsYOffset = portsArea ? (portsArea.offsetTop) : headerHeight;

                // Sync state if dimensions changed
                const stateNode = stateManager?.getState().nodes.get(node.id);
                const sizeChanged = stateNode && (Math.abs((stateNode.style?.width || 0) - w) > 1 || Math.abs((stateNode.style?.height || 0) - h) > 1);
                
                if (sizeChanged) {
                    stateNode.style = { ...stateNode.style, width: w, height: h };
                }

                // IMPORTANT: Position ports and labels synchronously BEFORE notifying state manager
                // This ensures edges find the correct 'cy' attributes in the DOM when they re-render.
                inPorts.forEach((p, i) => {
                    const y = portsYOffset + 13 + (i * portSpacing);
                    p.setAttribute('cy', y.toString());
                    p.setAttribute('cx', '-6');

                    const labelId = `label-in-${node.id}-${inputIds[i]}`;
                    let label = document.getElementById(labelId) as unknown as SVGTextElement | null;
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
                    let label = document.getElementById(labelId) as unknown as SVGTextElement | null;
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

                // Notify state manager ONLY after DOM is updated and correct
                const isFirstLayout = !wrapper.dataset.layoutSettled;
                if (isFirstLayout || sizeChanged) {
                    wrapper.dataset.layoutSettled = 'true';
                    stateManager?.forceUpdate();
                }
            });
        });
        ro.observe(wrapper);
        
        return g;
    }
}
