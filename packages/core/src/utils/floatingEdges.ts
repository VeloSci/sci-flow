import { Node, Position } from '../types';

/** Computes floating edge anchor points — edges connect to the closest boundary point. */
export function getFloatingEdgeAnchors(
    sourceNode: Node,
    targetNode: Node
): { source: Position; target: Position } {
    const sw = sourceNode.style?.width || 200;
    const sh = sourceNode.style?.height || 150;
    const tw = targetNode.style?.width || 200;
    const th = targetNode.style?.height || 150;

    const sCx = sourceNode.position.x + sw / 2;
    const sCy = sourceNode.position.y + sh / 2;
    const tCx = targetNode.position.x + tw / 2;
    const tCy = targetNode.position.y + th / 2;

    return {
        source: getClosestBoundaryPoint(
            { x: sCx, y: sCy }, sw, sh, { x: tCx, y: tCy }
        ),
        target: getClosestBoundaryPoint(
            { x: tCx, y: tCy }, tw, th, { x: sCx, y: sCy }
        )
    };
}

/** Find the closest point on a rectangle's boundary to a target point. */
function getClosestBoundaryPoint(
    center: Position, width: number, height: number, target: Position
): Position {
    const dx = target.x - center.x;
    const dy = target.y - center.y;

    if (dx === 0 && dy === 0) return { x: center.x, y: center.y - height / 2 };

    const hw = width / 2;
    const hh = height / 2;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Determine which edge the line intersects first
    if (absDx * hh > absDy * hw) {
        // Hits left or right edge
        const signX = dx > 0 ? 1 : -1;
        return {
            x: center.x + hw * signX,
            y: center.y + (dy * hw) / absDx
        };
    } else {
        // Hits top or bottom edge
        const signY = dy > 0 ? 1 : -1;
        return {
            x: center.x + (dx * hh) / absDy,
            y: center.y + hh * signY
        };
    }
}

/** Check if floating edge mode should be used based on node data. */
export function isFloatingEdge(
    sourceNode: Node, targetNode: Node
): boolean {
    return !!(sourceNode.data?.floatingEdge || targetNode.data?.floatingEdge);
}
