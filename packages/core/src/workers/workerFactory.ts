export function createPathfindingWorker(): Worker {
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
            let current = -1; lowestF = Infinity;
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
                if (isLineBlocked(p1, p2, obstacles)) continue;
                
                const dist = Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
                const tentativeG = (gScore.get(current) ?? Infinity) + dist;
                
                if (!openSet.has(nIdx)) openSet.add(nIdx);
                else if (tentativeG >= (gScore.get(nIdx) ?? Infinity)) continue;
                
                cameFrom.set(nIdx, current);
                gScore.set(nIdx, tentativeG);
                fScore.set(nIdx, tentativeG + Math.abs(target.x - p2.x) + Math.abs(target.y - p2.y));
            }
        }
        return 'M ' + source.x + ',' + source.y + ' L ' + target.x + ',' + target.y;
    }

    self.onmessage = function(e) {
        const { id, source, target, obstacles, padding } = e.data;
        const path = getSmartOrthogonalPath(source, target, obstacles, padding);
        self.postMessage({ id, path });
    };
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
}
