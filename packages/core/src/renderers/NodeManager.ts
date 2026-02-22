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
                    stateManager.onNodeMount(node.id, wrapper);
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
        const initialWidth = node.style?.width || 200;
        const initialHeight = node.style?.height || 100;
        foreignObj.setAttribute('width', initialWidth.toString());
        foreignObj.setAttribute('height', initialHeight.toString());
        foreignObj.style.overflow = 'visible';

        const wrapper = document.createElement('div');
        wrapper.className = 'sci-flow-node-wrapper';
        wrapper.dataset.type = node.type;
        
        // Ensure a minimum height based on ports
        const inputIds = Object.keys(node.inputs || {});
        const outputIds = Object.keys(node.outputs || {});
        const portCount = Math.max(inputIds.length, outputIds.length);
        const headerHeight = 32;
        const portSpacing = 26; // More space for independence
        const minH = headerHeight + (portCount * portSpacing) + 20;
        wrapper.style.minHeight = `${minH}px`;
        
        const nodeDef = registry.get(node.type);
        if (nodeDef?.renderHTML) {
            wrapper.appendChild(nodeDef.renderHTML(node));
        } else {
            wrapper.innerHTML = `
                <div class="sci-flow-node-header">
                    <strong>${node.type}</strong>
                    <span style="opacity: 0.5; font-size: 10px;">${node.id.slice(0, 8)}</span>
                </div>
                <div class="sci-flow-node-body">
                    Default Node Preview
                </div>`;
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

        const inPorts = inputIds.map(id => createSVGPort(id, 'in', node.inputs[id]?.dataType || 'any'));
        const outPorts = outputIds.map(id => createSVGPort(id, 'out', node.outputs[id]?.dataType || 'any'));

        let rafId: number;
        const ro = new ResizeObserver(() => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const w = wrapper.offsetWidth;
                const h = wrapper.offsetHeight;
                if (w === 0 || h === 0) return;

                foreignObj.setAttribute('width', w.toString());
                foreignObj.setAttribute('height', h.toString());

                // Sync state if needed
                const stateNode = stateManager?.getState().nodes.get(node.id);
                if (stateNode && (Math.abs((stateNode.style?.width || 0) - w) > 1 || Math.abs((stateNode.style?.height || 0) - h) > 1)) {
                    stateNode.style = { ...stateNode.style, width: w, height: h };
                    stateManager?.forceUpdate();
                }
                
                // Position ports and labels with fixed spacing
                inPorts.forEach((p, i) => {
                    const y = headerHeight + 18 + (i * portSpacing);
                    p.setAttribute('cy', y.toString());
                    p.setAttribute('cx', '-6'); // Slightly outside left edge

                    const labelId = `label-in-${node.id}-${inputIds[i]}`;
                    let label = document.getElementById(labelId) as unknown as SVGTextElement | null;
                    if (!label) {
                        label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        label.id = labelId;
                        label.setAttribute('class', 'sci-flow-port-label');
                        label.setAttribute('x', '12'); // More padding
                        label.style.pointerEvents = 'none';
                        g.appendChild(label); // On top of body
                    }
                    if (label) {
                        label.setAttribute('y', (y + 4).toString());
                        label.textContent = node.inputs[inputIds[i]]?.label || inputIds[i];
                    }
                });

                outPorts.forEach((p, i) => {
                    const y = headerHeight + 18 + (i * portSpacing);
                    p.setAttribute('cy', y.toString());
                    p.setAttribute('cx', String(w + 6)); // Slightly outside right edge

                    const labelId = `label-out-${node.id}-${outputIds[i]}`;
                    let label = document.getElementById(labelId) as unknown as SVGTextElement | null;
                    if (!label) {
                        label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        label.id = labelId;
                        label.setAttribute('class', 'sci-flow-port-label');
                        label.setAttribute('text-anchor', 'end');
                        label.style.pointerEvents = 'none';
                        g.appendChild(label); // On top of body
                    }
                    if (label) {
                        label.setAttribute('x', (w - 12).toString());
                        label.setAttribute('y', (y + 4).toString());
                        label.textContent = node.outputs[outputIds[i]]?.label || outputIds[i];
                    }
                });
            });
        });
        ro.observe(wrapper);
        
        return g;
    }
}
