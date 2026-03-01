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
export const getStepPath = (source: Position, target: Position, borderRadius = 0, padding = 40): string => {
    // 1. Extend horizontally from the source by `padding`
    const exitX = source.x + padding;
    
    // For backwards pointing edges (target is to the left of source + padding)
    // we need to add an extra vertical step to go around, but for standard
    // forward/downward flow, exitX is sufficient.
    const isBackwards = target.x <= exitX;
    
    // If it's a backwards edge, we might need a more complex path, but for 
    // a basic 3-segment orthogonal path (Horizontal -> Vertical -> Horizontal):
    // Path: Source -> (exitX, source.y) -> (exitX, target.y) -> Target
    
    if (borderRadius <= 0) {
        if (isBackwards) {
            // For backwards edges, go out, down/up to half distance, left, then to target
            const midY = source.y + (target.y - source.y) / 2;
            const targetPaddingX = target.x - padding;
            return `M ${source.x},${source.y} L ${exitX},${source.y} L ${exitX},${midY} L ${targetPaddingX},${midY} L ${targetPaddingX},${target.y} L ${target.x},${target.y}`;
        }
        return `M ${source.x},${source.y} L ${exitX},${source.y} L ${exitX},${target.y} L ${target.x},${target.y}`;
    }

    // --- Rounded version ---
    const deltaX1 = exitX - source.x;
    const deltaY = target.y - source.y;
    const deltaX2 = target.x - exitX;
    if (isBackwards) {
        // Fallback to straight corners for complex backwards routing
        const midY = source.y + deltaY / 2;
        const targetPaddingX = target.x - padding;
        return `M ${source.x},${source.y} L ${exitX},${source.y} L ${exitX},${midY} L ${targetPaddingX},${midY} L ${targetPaddingX},${target.y} L ${target.x},${target.y}`;
    }

    // Calculate safe radius
    const safeR = Math.min(borderRadius, Math.abs(deltaX1), Math.abs(deltaY / 2), Math.abs(deltaX2));
    
    if (safeR <= 1) {
        return `M ${source.x},${source.y} L ${exitX},${source.y} L ${exitX},${target.y} L ${target.x},${target.y}`;
    }

    const sx1 = Math.sign(deltaX1);
    const sy = Math.sign(deltaY);
    const sx2 = Math.sign(deltaX2);

    // Corner 1 (at exitX, source.y): moves horizontally then vertically
    const c1x = exitX - safeR * sx1;
    const c1y = source.y + safeR * sy;
    
    // Corner 2 (at exitX, target.y): moves vertically then horizontally
    const c2x = exitX + safeR * sx2;
    const c2y = target.y - safeR * sy;

    // Corner 1 sweep: if sx1*sy > 0 then clockwise (1), else counter-clockwise (0)
    const sweep1 = (sx1 * sy > 0) ? 1 : 0;
    // Corner 2 sweep: if crossing vertically then horizontally, sign logic
    const sweep2 = (sx2 * sy > 0) ? 0 : 1;

    return `M ${source.x},${source.y} ` +
           `L ${c1x},${source.y} ` +
           `A ${safeR},${safeR} 0 0 ${sweep1} ${exitX},${c1y} ` +
           `L ${exitX},${c2y} ` +
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
