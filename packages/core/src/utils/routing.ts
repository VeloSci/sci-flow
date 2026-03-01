import { Position, Rect } from '../types';

interface Point { x: number; y: number; }

export function getSmartOrthogonalPath(source: Position, target: Position, obstacles: Rect[], padding = 40): string {
    // 1. Define routing grid lines
    const xs = new Set<number>();
    const ys = new Set<number>();
    
    const startX = source.x;
    const startY = source.y;
    const endX = target.x;
    const endY = target.y;
    
    xs.add(startX); xs.add(endX);
    ys.add(startY); ys.add(endY);

    // Add source/target port "exit" points to encourage orthogonal start/end
    xs.add(startX + padding); xs.add(startX - padding);
    ys.add(startY + padding); ys.add(startY - padding);
    xs.add(endX + padding);   xs.add(endX - padding);
    ys.add(endY + padding);   ys.add(endY - padding);
    
    for (const obs of obstacles) {
        xs.add(obs.x);
        xs.add(obs.x + obs.width);
        xs.add(obs.x - padding);
        xs.add(obs.x + obs.width + padding);
        
        ys.add(obs.y);
        ys.add(obs.y + obs.height);
        ys.add(obs.y - padding);
        ys.add(obs.y + obs.height + padding);
    }
    
    // Filter and sort
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
    
    const startYIdx = yGrid.indexOf(startY);
    const endYIdx = yGrid.indexOf(endY);
    const startXIdx = xGrid.indexOf(startX);
    const endXIdx = xGrid.indexOf(endX);

    const fallbackPath = (s: Position, t: Position) => {
        const exitX = s.x + padding;
        const isBackwards = t.x <= exitX;
        if (isBackwards) {
            const midY = s.y + (t.y - s.y) / 2;
            const targetPaddingX = t.x - padding;
            return `M ${s.x},${s.y} L ${exitX},${s.y} L ${exitX},${midY} L ${targetPaddingX},${midY} L ${targetPaddingX},${t.y} L ${t.x},${t.y}`;
        }
        return `M ${s.x},${s.y} L ${exitX},${s.y} L ${exitX},${t.y} L ${t.x},${t.y}`;
    };

    if (startXIdx === -1 || startYIdx === -1 || endXIdx === -1 || endYIdx === -1) {
        return fallbackPath(source, target);
    }

    // Early optimization: If the preferred flowchart fallback path is clear, use it!
    const exitX = source.x + padding;
    const isBackwards = target.x <= exitX;
    let fallbackIsClear = true;
    
    if (isBackwards) {
        const midY = source.y + (target.y - source.y) / 2;
        const targetPaddingX = target.x - padding;
        if (
            isLineBlocked({x: source.x, y: source.y}, {x: exitX, y: source.y}) ||
            isLineBlocked({x: exitX, y: source.y}, {x: exitX, y: midY}) ||
            isLineBlocked({x: exitX, y: midY}, {x: targetPaddingX, y: midY}) ||
            isLineBlocked({x: targetPaddingX, y: midY}, {x: targetPaddingX, y: target.y}) ||
            isLineBlocked({x: targetPaddingX, y: target.y}, {x: target.x, y: target.y})
        ) {
            fallbackIsClear = false;
        }
    } else {
        if (
            isLineBlocked({x: source.x, y: source.y}, {x: exitX, y: source.y}) ||
            isLineBlocked({x: exitX, y: source.y}, {x: exitX, y: target.y}) ||
            isLineBlocked({x: exitX, y: target.y}, {x: target.x, y: target.y})
        ) {
            fallbackIsClear = false;
        }
    }

    if (fallbackIsClear) {
        return fallbackPath(source, target);
    }

    const startIdx = getIdx(startXIdx, startYIdx);
    const endIdx = getIdx(endXIdx, endYIdx);

    const openSet = new Set<number>([startIdx]);
    const closedSet = new Set<number>();
    const gScore = new Map<number, number>();
    const fScore = new Map<number, number>();
    const cameFrom = new Map<number, number>();
    
    gScore.set(startIdx, 0);
    fScore.set(startIdx, Math.abs(target.x - source.x) + Math.abs(target.y - source.y));

    while (openSet.size > 0) {
        // ... (existing search logic) ...
        let current = -1;
        let lowestF = Infinity;
        for (const node of openSet) {
            const f = fScore.get(node) ?? Infinity;
            if (f < lowestF) { lowestF = f; current = node; }
        }

        if (current === endIdx) {
            // Reconstruct path
            const pathPoints: Point[] = [];
            let curr = current;
            while (curr !== startIdx) {
                const { xi, yi } = getCoords(curr);
                pathPoints.unshift({ x: xGrid[xi], y: yGrid[yi] });
                curr = cameFrom.get(curr)!;
            }
            pathPoints.unshift({ x: source.x, y: source.y });
            
            // Clean up straight lines
            const cleanPath = [pathPoints[0]];
            for (let i = 1; i < pathPoints.length - 1; i++) {
                const prev = pathPoints[i-1];
                const next = pathPoints[i+1];
                const p = pathPoints[i];
                if ((prev.x === p.x && p.x === next.x) || (prev.y === p.y && p.y === next.y)) {
                    continue;
                }
                cleanPath.push(p);
            }
            cleanPath.push(pathPoints[pathPoints.length - 1]);

            return `M ${cleanPath.map(p => `${p.x},${p.y}`).join(' L ')}`;
        }

        openSet.delete(current);
        closedSet.add(current);

        const { xi, yi } = getCoords(current);
        const p1 = { x: xGrid[xi], y: yGrid[yi] };

        // Neighbors
        const neighbors = [];
        if (xi > 0) neighbors.push({ xi: xi - 1, yi });
        if (xi < xGrid.length - 1) neighbors.push({ xi: xi + 1, yi });
        if (yi > 0) neighbors.push({ xi, yi: yi - 1 });
        if (yi < yGrid.length - 1) neighbors.push({ xi, yi: yi + 1 });

        for (const neighbor of neighbors) {
            const nIdx = getIdx(neighbor.xi, neighbor.yi);
            if (closedSet.has(nIdx)) continue;
            
            const p2 = { x: xGrid[neighbor.xi], y: yGrid[neighbor.yi] };
            
            if (isLineBlocked(p1, p2)) continue;

            let penalty = 0;
            const isHorizontal = neighbor.yi === yi;
            const isVertical = !isHorizontal;

            // 1. Turn penalty (strongly enforce orthogonal segments)
            if (cameFrom.has(current)) {
                const prevIdx = cameFrom.get(current)!;
                const prevCoords = getCoords(prevIdx);
                const wasHorizontal = prevCoords.yi === yi;
                if (wasHorizontal !== isHorizontal) {
                    // Check if turning at an intended bending point
                    const isExitPadding = Math.abs(p1.x - (source.x + padding)) < 1;
                    const isTargetPadding = Math.abs(p1.x - (target.x - padding)) < 1;
                    
                    if (isExitPadding) {
                        penalty += 50; // Highest priority turn (exit column)
                    } else if (isTargetPadding) {
                        penalty += 150; // Second priority turn
                    } else {
                        penalty += 600; // Discouraged middle-of-nowhere turn
                    }
                }
            }

            // 2. "Exit Segment" Heuristic (Scientific Flow Priority)
            // If we are at the source row level and haven't reached the horizontal exit padding yet,
            // we strongly penalize moving vertically.
            if (Math.abs(p1.y - source.y) < 2 && p1.x < source.x + padding - 1) {
                if (isVertical) {
                    penalty += 1000; // Block premature turns
                } else if (isHorizontal && p2.x > p1.x) {
                    penalty -= 20; // Slight incentive to move along the exit line
                }
            }

            const dist = Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y);
            const tentativeG = (gScore.get(current) ?? 0) + dist + penalty;

            if (!openSet.has(nIdx) || tentativeG < (gScore.get(nIdx) ?? Infinity)) {
                cameFrom.set(nIdx, current);
                gScore.set(nIdx, tentativeG);
                fScore.set(nIdx, tentativeG + Math.abs(target.x - p2.x) + Math.abs(target.y - p2.y));
                openSet.add(nIdx);
            }
        }
    }

    return fallbackPath(source, target);
}
