import { Position, Rect } from '../types';

interface Point { x: number; y: number; }

export function getSmartOrthogonalPath(source: Position, target: Position, obstacles: Rect[], padding = 20): string {
    // 1. Define routing grid lines
    const xs = new Set<number>();
    const ys = new Set<number>();
    
    const startX = source.x + padding;
    const endX = target.x - padding;
    
    xs.add(source.x); xs.add(startX); xs.add(target.x); xs.add(endX);
    ys.add(source.y); ys.add(target.y);
    
    for (const obs of obstacles) {
        xs.add(obs.x - padding);
        xs.add(obs.x + obs.width + padding);
        ys.add(obs.y - padding);
        ys.add(obs.y + obs.height + padding);
    }
    
    const xGrid = Array.from(xs).sort((a, b) => a - b);
    const yGrid = Array.from(ys).sort((a, b) => a - b);
    
    // 2. Helper to check if a line segment overlaps any true obstacle bounds
    const isLineBlocked = (p1: Point, p2: Point): boolean => {
        for (const obs of obstacles) {
            // We consider the obstacle blocked if we are strictly inside it.
            // Since we padded the grid lines, lines running *on* the padding are outside the strict obstacle
            // So we check against actual obstacle bounds.
            const ox1 = obs.x - 1; // minor epsilon tolerance
            const ox2 = obs.x + obs.width + 1;
            const oy1 = obs.y - 1;
            const oy2 = obs.y + obs.height + 1;

            if (p1.x === p2.x) { // Vertical line
                if (p1.x > ox1 && p1.x < ox2) {
                    const minY = Math.min(p1.y, p2.y);
                    const maxY = Math.max(p1.y, p2.y);
                    if (minY < oy2 && maxY > oy1) return true;
                }
            } else { // Horizontal line
                if (p1.y > oy1 && p1.y < oy2) {
                    const minX = Math.min(p1.x, p2.x);
                    const maxX = Math.max(p1.x, p2.x);
                    if (minX < ox2 && maxX > ox1) return true;
                }
            }
        }
        return false;
    };

    // 3. A* Search over the grid points
    // Node representation: index = idx(x, y)
    const getIdx = (xi: number, yi: number) => yi * xGrid.length + xi;
    const getCoords = (idx: number) => ({ xi: idx % xGrid.length, yi: Math.floor(idx / xGrid.length) });
    
    let startIdx = 0; let endIdx = 0;
    // Find closest grid indices for source and target
    for(let i=0; i<xGrid.length; i++) {
        if (xGrid[i] === source.x) startIdx = getIdx(i, yGrid.indexOf(source.y));
        if (xGrid[i] === target.x) endIdx = getIdx(i, yGrid.indexOf(target.y));
    }

    const openSet = new Set<number>([startIdx]);
    const closedSet = new Set<number>();
    const gScore = new Map<number, number>();
    const fScore = new Map<number, number>();
    const cameFrom = new Map<number, number>();
    
    gScore.set(startIdx, 0);
    fScore.set(startIdx, Math.abs(target.x - source.x) + Math.abs(target.y - source.y));

    while (openSet.size > 0) {
        // Get lowest fScore
        let current = -1;
        let lowestF = Infinity;
        for (const node of openSet) {
            const f = fScore.get(node) ?? Infinity;
            if (f < lowestF) { lowestF = f; current = node; }
        }

        if (current === endIdx) {
            // Reconstruct path
            const path: Point[] = [];
            let curr = current;
            while (cameFrom.has(curr)) {
                const { xi, yi } = getCoords(curr);
                path.unshift({ x: xGrid[xi], y: yGrid[yi] });
                curr = cameFrom.get(curr)!;
            }
            path.unshift({ x: source.x, y: source.y });
            
            // Clean up straight lines (remove collinear points)
            const cleanPath = [path[0]];
            for (let i = 1; i < path.length - 1; i++) {
                const prev = path[i-1];
                const next = path[i+1];
                const p = path[i];
                if ((prev.x === p.x && p.x === next.x) || (prev.y === p.y && p.y === next.y)) {
                    continue; // Collinear
                }
                cleanPath.push(p);
            }
            cleanPath.push(path[path.length - 1]);

            return `M ${cleanPath.map(p => `${p.x},${p.y}`).join(' L ')}`;
        }

        openSet.delete(current);
        closedSet.add(current);

        const { xi, yi } = getCoords(current);
        const p1 = { x: xGrid[xi], y: yGrid[yi] };

        // Neighbors (up, down, left, right)
        const neighbors = [];
        if (xi > 0) neighbors.push({ xi: xi - 1, yi });
        if (xi < xGrid.length - 1) neighbors.push({ xi: xi + 1, yi });
        if (yi > 0) neighbors.push({ xi, yi: yi - 1 });
        if (yi < yGrid.length - 1) neighbors.push({ xi, yi: yi + 1 });

        for (const neighbor of neighbors) {
            const nIdx = getIdx(neighbor.xi, neighbor.yi);
            if (closedSet.has(nIdx)) continue;
            
            const p2 = { x: xGrid[neighbor.xi], y: yGrid[neighbor.yi] };
            
            // Directional penalties to encourage simple paths
            let penalty = 0;
            if (cameFrom.has(current)) {
               const prev = getCoords(cameFrom.get(current)!);
               const wasHorizontal = prev.yi === yi;
               const isHorizontal = neighbor.yi === yi;
               if (wasHorizontal !== isHorizontal) penalty += 50; // Penalty for turning
            }
            
            if (isLineBlocked(p1, p2)) continue; // Blocked

            const tentativeG = gScore.get(current)! + Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y) + penalty;

            if (!openSet.has(nIdx)) openSet.add(nIdx);
            else if (tentativeG >= (gScore.get(nIdx) ?? Infinity)) continue;

            cameFrom.set(nIdx, current);
            gScore.set(nIdx, tentativeG);
            fScore.set(nIdx, tentativeG + Math.abs(target.x - p2.x) + Math.abs(target.y - p2.y));
        }
    }

    // Fallback if no path found (drawn straight through everything)
    const midX = source.x + (target.x - source.x) / 2;
    return `M ${source.x},${source.y} L ${midX},${source.y} L ${midX},${target.y} L ${target.x},${target.y}`;
}
