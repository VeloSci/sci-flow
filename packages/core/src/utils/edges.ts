import { Position, Rect } from '../types';
import { getSmartOrthogonalPath } from './routing';

export type EdgeRoutingMode = 'bezier' | 'straight' | 'step' | 'smooth-step' | 'smart';

export interface GetEdgePathParams {
    source: Position;
    target: Position;
    mode?: EdgeRoutingMode;
    curvature?: number; // For bezier and smooth-step
    obstacles?: Rect[];
}

/**
 * Calculates a standard horizontal cubic bezier curve string for SVG
 */
export const getBezierPath = (source: Position, target: Position, curvature = 0.25): string => {
    // Increase curvature based on horizontal distance
    const cx = (target.x - source.x) * curvature;
    
    // x1, y1, handle1X, handle1Y, handle2X, handle2Y, x2, y2
    return `M ${source.x},${source.y} C ${source.x + cx},${source.y} ${target.x - cx},${target.y} ${target.x},${target.y}`;
};

/**
 * Calculates a straight line path string
 */
export const getStraightPath = (source: Position, target: Position): string => {
    return `M ${source.x},${source.y} L ${target.x},${target.y}`;
}

/**
 * Calculates a stepped orthogonal path (Manhattan routing)
 */
export const getStepPath = (source: Position, target: Position, borderRadius = 0): string => {
    const deltaX = target.x - source.x;
    const midX = source.x + deltaX / 2;
    
    if (borderRadius <= 0) {
       return `M ${source.x},${source.y} L ${midX},${source.y} L ${midX},${target.y} L ${target.x},${target.y}`;
    }

    const deltaY = target.y - source.y;
    // Calculate safe radius (cannot exceed half of any segment length)
    const safeR = Math.min(borderRadius, Math.abs(deltaX / 2), Math.abs(deltaY / 2));
    
    if (safeR <= 1) {
       return `M ${source.x},${source.y} L ${midX},${source.y} L ${midX},${target.y} L ${target.x},${target.y}`;
    }

    const sx = Math.sign(deltaX);
    const sy = Math.sign(deltaY);

    // Points: P0(source) -> P1(mid, sy) -> P2(mid, ty) -> P3(target)
    // Using absolute A (arc) commands: (rx ry x-axis-rotation large-arc-flag sweep-flag x y)
    // Sweep flag: 1 if clockwise, 0 if counter-clockwise.
    // Corner 1 (at midX, source.y): moves horizontally then vertically
    const c1x = midX - safeR * sx;
    const c1y = source.y + safeR * sy;
    
    // Corner 2 (at midX, target.y): moves vertically then horizontally
    const c2x = midX + safeR * sx;
    const c2y = target.y - safeR * sy;

    // Corner 1 sweep: if sx*sy > 0 (1,1 or -1,-1) then clockwise (1), else counter-clockwise (0)
    const sweep1 = (sx * sy > 0) ? 1 : 0;
    // Corner 2 sweep is always the opposite of corner 1
    const sweep2 = (sx * sy > 0) ? 0 : 1;

    return `M ${source.x},${source.y} ` +
           `L ${c1x},${source.y} ` +
           `A ${safeR},${safeR} 0 0 ${sweep1} ${midX},${c1y} ` +
           `L ${midX},${c2y} ` +
           `A ${safeR},${safeR} 0 0 ${sweep2} ${c2x},${target.y} ` +
           `L ${target.x},${target.y}`;
}

export const getEdgePath = ({ source, target, mode = 'bezier', curvature = 0.5, obstacles = [] }: GetEdgePathParams): string => {
    switch(mode) {
        case 'straight': return getStraightPath(source, target);
        case 'step': return getStepPath(source, target, 0);
        case 'smooth-step': return getStepPath(source, target, 8); // simplified fallback
        case 'smart': return getSmartOrthogonalPath(source, target, obstacles);
        case 'bezier':
        default: return getBezierPath(source, target, curvature);
    }
}
