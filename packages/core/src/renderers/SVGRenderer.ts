import { BaseRenderer, RendererOptions } from './BaseRenderer';
import { FlowState } from '../types';
import { getEdgePath } from '../utils/edges';
import { PathfindingWorkerMessageData, PathfindingWorkerResponse } from '../workers/pathfinding.worker';

// Worker factory can be inline to survive bundling or provided as a separate entry
// We'll create it via blob to ensure extreme portability across environments without special bundler plugins
function createPathfindingWorker(): Worker {
    // A stringified minimal version of the router for the blob
    // In a real production setup, this is usually handled by Vite/Rollup `?worker` imports.
    // For this monorepo, using a Blob ensures zero-config compat with React/Vue apps consuming it.
    const workerCode = `
    const isLineBlocked = (p1, p2, obstacles) => {
        for (const obs of obstacles) {
            const ox1 = obs.x - 1; const ox2 = obs.x + obs.width + 1;
            const oy1 = obs.y - 1; const oy2 = obs.y + obs.height + 1;
            if (p1.x === p2.x) { 
                if (p1.x > ox1 && p1.x < ox2) {
                    const minY = Math.min(p1.y, p2.y);
                    const maxY = Math.max(p1.y, p2.y);
                    if (minY < oy2 && maxY > oy1) return true;
                }
            } else { 
                if (p1.y > oy1 && p1.y < oy2) {
                    const minX = Math.min(p1.x, p2.x);
                    const maxX = Math.max(p1.x, p2.x);
                    if (minX < ox2 && maxX > ox1) return true;
                }
            }
        }
        return false;
    };
    
    function getSmartOrthogonalPath(source, target, obstacles, padding = 20) {
        const xs = new Set(); const ys = new Set();
        const startX = source.x + padding; const endX = target.x - padding;
        xs.add(source.x); xs.add(startX); xs.add(target.x); xs.add(endX);
        ys.add(source.y); ys.add(target.y);
        
        for (const obs of obstacles) {
            xs.add(obs.x - padding); xs.add(obs.x + obs.width + padding);
            ys.add(obs.y - padding); ys.add(obs.y + obs.height + padding);
        }
        
        const xGrid = Array.from(xs).sort((a, b) => a - b);
        const yGrid = Array.from(ys).sort((a, b) => a - b);
        
        const getIdx = (xi, yi) => yi * xGrid.length + xi;
        const getCoords = (idx) => ({ xi: idx % xGrid.length, yi: Math.floor(idx / xGrid.length) });
        
        let startIdx = 0; let endIdx = 0;
        for(let i=0; i<xGrid.length; i++) {
            if (xGrid[i] === source.x) startIdx = getIdx(i, yGrid.indexOf(source.y));
            if (xGrid[i] === target.x) endIdx = getIdx(i, yGrid.indexOf(target.y));
        }

        const openSet = new Set([startIdx]);
        const closedSet = new Set();
        const gScore = new Map();
        const fScore = new Map();
        const cameFrom = new Map();
        
        gScore.set(startIdx, 0);
        fScore.set(startIdx, Math.abs(target.x - source.x) + Math.abs(target.y - source.y));

        while (openSet.size > 0) {
            let current = -1; let lowestF = Infinity;
            for (const node of openSet) {
                const f = fScore.get(node) ?? Infinity;
                if (f < lowestF) { lowestF = f; current = node; }
            }

            if (current === endIdx) {
                const path = [];
                let curr = current;
                while (cameFrom.has(curr)) {
                    const { xi, yi } = getCoords(curr);
                    path.unshift({ x: xGrid[xi], y: yGrid[yi] });
                    curr = cameFrom.get(curr);
                }
                path.unshift({ x: source.x, y: source.y });
                
                const cleanPath = [path[0]];
                for (let i = 1; i < path.length - 1; i++) {
                    const prev = path[i-1]; const next = path[i+1]; const p = path[i];
                    if ((prev.x === p.x && p.x === next.x) || (prev.y === p.y && p.y === next.y)) continue;
                    cleanPath.push(p);
                }
                cleanPath.push(path[path.length - 1]);
                return 'M ' + cleanPath.map(p => p.x + ',' + p.y).join(' L ');
            }

            openSet.delete(current); closedSet.add(current);
            const { xi, yi } = getCoords(current);
            const p1 = { x: xGrid[xi], y: yGrid[yi] };

            const neighbors = [];
            if (xi > 0) neighbors.push({ xi: xi - 1, yi });
            if (xi < xGrid.length - 1) neighbors.push({ xi: xi + 1, yi });
            if (yi > 0) neighbors.push({ xi, yi: yi - 1 });
            if (yi < yGrid.length - 1) neighbors.push({ xi, yi: yi + 1 });

            for (const neighbor of neighbors) {
                const nIdx = getIdx(neighbor.xi, neighbor.yi);
                if (closedSet.has(nIdx)) continue;
                
                const p2 = { x: xGrid[neighbor.xi], y: yGrid[neighbor.yi] };
                
                let penalty = 0;
                if (cameFrom.has(current)) {
                   const prev = getCoords(cameFrom.get(current));
                   const wasHorizontal = prev.yi === yi;
                   const isHorizontal = neighbor.yi === yi;
                   if (wasHorizontal !== isHorizontal) penalty += 50; 
                }
                
                if (isLineBlocked(p1, p2, obstacles)) continue; 

                const tentativeG = gScore.get(current) + Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y) + penalty;

                if (!openSet.has(nIdx)) openSet.add(nIdx);
                else if (tentativeG >= (gScore.get(nIdx) ?? Infinity)) continue;

                cameFrom.set(nIdx, current);
                gScore.set(nIdx, tentativeG);
                fScore.set(nIdx, tentativeG + Math.abs(target.x - p2.x) + Math.abs(target.y - p2.y));
            }
        }
        const midX = source.x + (target.x - source.x) / 2;
        return 'M ' + source.x + ',' + source.y + ' L ' + midX + ',' + source.y + ' L ' + midX + ',' + target.y + ' L ' + target.x + ',' + target.y;
    }

    self.onmessage = (e) => {
        const { id, source, target, obstacles, padding } = e.data;
        const path = getSmartOrthogonalPath(source, target, obstacles, padding);
        self.postMessage({ id, path });
    };
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
}

export class SVGRenderer extends BaseRenderer {
  private svg: SVGSVGElement;
  private nodesGroup: SVGGElement;
  private edgesGroup: SVGGElement;
  
  // Async Routing Support
  private routerWorker: Worker;
  private pendingRoutes: Map<string, (path: string) => void> = new Map();
  private routerIdCounter = 0;

  // Cache for path strings so we don't recalculate unchanged routes
  private routeCache: Map<string, string> = new Map();
  // Fast comparison cache to quickly bust worker tasks
  private routingHashCache: Map<string, string> = new Map();

  constructor(options: RendererOptions) {
    super(options);
    
    // Init Worker
    this.routerWorker = createPathfindingWorker();
    this.routerWorker.onmessage = (e: MessageEvent<PathfindingWorkerResponse>) => {
        const { id, path } = e.data;
        if (this.pendingRoutes.has(id)) {
            this.pendingRoutes.get(id)!(path);
            this.pendingRoutes.delete(id);
        }
    };

    // Create base SVG structure
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.style.width = '100%';
    this.svg.style.height = '100%';
    this.svg.style.display = 'block';
    this.svg.setAttribute('class', 'sci-flow-svg-renderer');

    // Create groups for layers
    this.edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.edgesGroup.setAttribute('class', 'sci-flow-edges');

    this.nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.nodesGroup.setAttribute('class', 'sci-flow-nodes');

    // Append to SVG
    this.svg.appendChild(this.edgesGroup);
    this.svg.appendChild(this.nodesGroup);

    // Append to container
    this.container.appendChild(this.svg);
  }

  public render(state: FlowState, registry: Map<string, any>): void {
    // Apply viewport transform calculation
    const transform = `translate(${state.viewport.x}, ${state.viewport.y}) scale(${state.viewport.zoom})`;
    this.edgesGroup.setAttribute('transform', transform);
    this.nodesGroup.setAttribute('transform', transform);

    // Simple DOM Reconciliation for nodes
    const existingNodeDocs = new Set(Array.from(this.nodesGroup.children).map(n => n.id));
    
    state.nodes.forEach(node => {
      let g = document.getElementById(`node-${node.id}`) as SVGGElement | null;
      if (!g) {
        g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.id = `node-${node.id}`;
        g.setAttribute('class', 'sci-flow-node');
        
        // Use ForeignObject to allow complex HTML layouts inside SVG nodes
        const foreignObj = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        // Setting fixed numeric sizes causes hit detection boxes to misalign with dynamic React nodes.
        // We will set to 1x1 with visible overflow so the inner HTML wrapper dictates the actual interactive bounding box
        foreignObj.setAttribute('width', '1');
        foreignObj.setAttribute('height', '1');
        foreignObj.style.overflow = 'visible';

        const wrapper = document.createElement('div');
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.position = 'relative';
        
        // Dynamically get node component from registry, fallback to basic div
        const nodeDef = registry.get(node.type);
        if (nodeDef && nodeDef.renderHTML) {
            const el = nodeDef.renderHTML(node);
            wrapper.appendChild(el);
        } else {
            wrapper.innerHTML = `<div style="background: #333; color: white; padding: 10px; border-radius: 6px;">
              <strong>${node.type}</strong><br/>
              <small>${node.id}</small>
            </div>`;
        }

        foreignObj.appendChild(wrapper);
        g.appendChild(foreignObj);
        this.nodesGroup.appendChild(g);

        // Notify state manager that a DOM container was created for this node
        // This allows React Portals or Vue Teleports to hook in here.
        // Note: SVGRenderer needs access to the stateManager. We will pass it via the SciFlow initialization.
        const sm = (this as any).stateManager;
        if (sm?.onNodeMount) {
            sm.onNodeMount(node.id, wrapper); // Pass the wrapper div as the mount point
        }
      }
      
      // Update position
      g.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);
      existingNodeDocs.delete(`node-${node.id}`);
    });

    // Cleanup abandoned nodes
    existingNodeDocs.forEach(id => {
      document.getElementById(id)?.remove();
      const sm = (this as any).stateManager;
      if (sm?.onNodeUnmount) {
          sm.onNodeUnmount(id);
      }
    });

    // Simple DOM Reconciliation for edges
    const existingEdgeDocs = new Set(Array.from(this.edgesGroup.children).map(n => n.id));

    // Gather obstacles for Smart Routing
    const obstacles = Array.from(state.nodes.values()).map(n => ({
        x: n.position.x,
        y: n.position.y,
        width: n.style?.width || 200,
        height: n.style?.height || 150
    }));

    state.edges.forEach(edge => {
      const sourceNode = state.nodes.get(edge.source);
      const targetNode = state.nodes.get(edge.target);

      if (!sourceNode || !targetNode) return;

      // Simplistic coordinates: attach to right side of source, left side of target
      const sourcePos = {
         x: sourceNode.position.x + (sourceNode.style?.width || 200),
         y: sourceNode.position.y + (sourceNode.style?.height || 150) / 2
      };
      
      const targetPos = {
         x: targetNode.position.x,
         y: targetNode.position.y + (targetNode.style?.height || 150) / 2
      };

        const routingMode = (edge.type as any) || 'bezier';
        
        // Use a Group to bundle the hit-area path, the visual path, and the port indicators
        let group = document.getElementById(`edge-group-${edge.id}`) as SVGGElement | null;
        if (!group) {
            group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.id = `edge-group-${edge.id}`;
            group.setAttribute('class', 'sci-flow-edge-group');
            
            // Invisible wider background path for easy hovering/clicking
            const bgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            bgPath.setAttribute('class', 'sci-flow-edge-bg');
            bgPath.setAttribute('fill', 'none');
            bgPath.style.stroke = 'transparent';
            bgPath.style.strokeWidth = '20px'; // 20px hit area
            bgPath.style.cursor = 'pointer';
            bgPath.style.pointerEvents = 'stroke'; // ensure this path exclusively catches structural pointer events
            
            // The actual visible edge path
            const fgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            fgPath.setAttribute('class', 'sci-flow-edge-fg');
            fgPath.setAttribute('fill', 'none');
            fgPath.style.pointerEvents = 'none'; // Let bgPath handle interactions
            
            // Source Port Indicator (Circle)
            const sourcePort = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            sourcePort.setAttribute('class', 'sci-flow-port-source');
            sourcePort.setAttribute('r', '5');
            
            // Target Port Indicator (Circle)
            const targetPort = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            targetPort.setAttribute('class', 'sci-flow-port-target');
            targetPort.setAttribute('r', '5');

            group.appendChild(bgPath);
            group.appendChild(fgPath);
            group.appendChild(sourcePort);
            group.appendChild(targetPort);
            this.edgesGroup.appendChild(group);
        }

        const bgPath = group.querySelector('.sci-flow-edge-bg') as SVGPathElement;
        const fgPath = group.querySelector('.sci-flow-edge-fg') as SVGPathElement;
        const sourcePort = group.querySelector('.sci-flow-port-source') as SVGCircleElement;
        const targetPort = group.querySelector('.sci-flow-port-target') as SVGCircleElement;

        // Apply visual styling
        fgPath.style.stroke = edge.selected ? 'var(--sf-edge-active)' : 'var(--sf-edge-line)';
        fgPath.style.strokeWidth = edge.selected ? '3px' : '2px';
        
        sourcePort.style.fill = 'var(--sf-bg)';
        sourcePort.style.stroke = edge.selected ? 'var(--sf-edge-active)' : 'var(--sf-edge-line)';
        sourcePort.style.strokeWidth = '2px';

        targetPort.style.fill = 'var(--sf-bg)';
        targetPort.style.stroke = edge.selected ? 'var(--sf-edge-active)' : 'var(--sf-edge-line)';
        targetPort.style.strokeWidth = '2px';

        if (edge.animated) {
            fgPath.style.strokeDasharray = '5, 5';
            fgPath.style.animation = 'sf-dash-anim 1s linear infinite';
        } else {
            fgPath.style.strokeDasharray = 'none';
            fgPath.style.animation = 'none';
        }

        // Apply Port Coordinates
        sourcePort.setAttribute('cx', `${sourcePos.x}`);
        sourcePort.setAttribute('cy', `${sourcePos.y}`);
        targetPort.setAttribute('cx', `${targetPos.x}`);
        targetPort.setAttribute('cy', `${targetPos.y}`);

        // Routing Execution
        const routeHash = `${sourcePos.x},${sourcePos.y}|${targetPos.x},${targetPos.y}|${routingMode}|${obstacles.length}`;
        
        const setPaths = (p: string) => {
            bgPath.setAttribute('d', p);
            fgPath.setAttribute('d', p);
        };

        if (routingMode === 'smart') {
            if (this.routeCache.has(edge.id) && this.routingHashCache.get(edge.id) === routeHash) {
                setPaths(this.routeCache.get(edge.id)!);
            } else {
                // Not cached or invalidated. Quickly draw temporary straight/stepped line.
                const tempPath = getEdgePath({ source: sourcePos, target: targetPos, mode: 'step' });
                setPaths(tempPath);

                // Dispatch to worker
                const jobId = `job-${this.routerIdCounter++}`;
                this.pendingRoutes.set(jobId, (finalPath: string) => {
                    this.routeCache.set(edge.id, finalPath);
                    this.routingHashCache.set(edge.id, routeHash);
                    // Update DOM asynchronously if group still exists
                    const g = document.getElementById(`edge-group-${edge.id}`);
                    if (g) {
                        const bg = g.querySelector('.sci-flow-edge-bg') as SVGPathElement;
                        const fg = g.querySelector('.sci-flow-edge-fg') as SVGPathElement;
                        bg.setAttribute('d', finalPath);
                        fg.setAttribute('d', finalPath);
                    }
                });

                this.routerWorker.postMessage({
                    id: jobId,
                    source: sourcePos,
                    target: targetPos,
                    obstacles,
                    padding: 20
                } as PathfindingWorkerMessageData);
            }
        } else {
            // Synchronous routing
            const pathString = getEdgePath({ source: sourcePos, target: targetPos, mode: routingMode, obstacles });
            setPaths(pathString);
            this.routeCache.set(edge.id, pathString);
            this.routingHashCache.set(edge.id, routeHash);
        }

        existingEdgeDocs.delete(`edge-group-${edge.id}`);
    });

    // Cleanup abandoned edges
    existingEdgeDocs.forEach(id => {
      document.getElementById(id)?.remove();
    });

    // Render Draft Edge
    let draftPath = document.getElementById('sci-flow-draft-edge') as SVGPathElement | null;
    if (state.draftEdge) {
        if (!draftPath) {
            draftPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            draftPath.id = 'sci-flow-draft-edge';
            draftPath.setAttribute('class', 'sci-flow-edge sci-flow-draft-edge');
            draftPath.setAttribute('fill', 'none');
            draftPath.setAttribute('stroke', 'var(--sf-edge-animated)');
            draftPath.setAttribute('stroke-width', '3');
            draftPath.setAttribute('stroke-dasharray', '5, 5');
            draftPath.style.pointerEvents = 'none'; // so it doesn't block target ports
            
            // Re-insert at the start of edgesGroup so it renders below nodes/ports
            if (this.edgesGroup.firstChild) {
                this.edgesGroup.insertBefore(draftPath, this.edgesGroup.firstChild);
            } else {
                this.edgesGroup.appendChild(draftPath);
            }
        }

        const sourceNode = state.nodes.get(state.draftEdge.sourceNodeId);
        if (sourceNode) {
            // Very simplistic layout assumption:
            // Output port is randomly placed midway right side for visual drafting.
            // Ideally we get the position of the port element from the DOM or model.
            // But this will suffice to show the connection dragging UX.
            const sourcePos = {
               x: sourceNode.position.x + (sourceNode.style?.width || 200),
               y: sourceNode.position.y + (sourceNode.style?.height || 150) / 2
            };
            
            const targetPos = state.draftEdge.targetPosition;
            const pathString = getEdgePath({ source: sourcePos, target: targetPos, mode: 'bezier' });
            draftPath.setAttribute('d', pathString);
        }
    } else if (draftPath) {
        draftPath.remove();
    }
  }

  public getViewportElement(): SVGElement {
      return this.svg;
  }

  public destroy(): void {
    this.svg.remove();
  }
}
