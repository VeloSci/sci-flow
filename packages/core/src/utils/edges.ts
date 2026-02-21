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
    // const deltaY = target.y - source.y;
    
    // Middle point for step
    const midX = source.x + deltaX / 2;
    
    // Basic orthogonal without radii for now
    if (borderRadius <= 0) {
       return `M ${source.x},${source.y} L ${midX},${source.y} L ${midX},${target.y} L ${target.x},${target.y}`;
    }

    // TODO: Implement complex smooth step algorithm with arcs
    return `M ${source.x},${source.y} L ${midX},${source.y} L ${midX},${target.y} L ${target.x},${target.y}`;
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
