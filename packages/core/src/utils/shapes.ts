import { Position } from '../types';

export type NodeShape = 'rectangle' | 'circle' | 'diamond' | 'hexagon' | 'ellipse' | 'parallelogram';

export interface ShapeBounds {
    x: number; y: number;
    width: number; height: number;
}

/** Get the SVG clip-path definition for a given shape. */
export function getShapeClipPath(shape: NodeShape, w: number, h: number): string {
    switch (shape) {
        case 'circle':
            return `circle(${Math.min(w, h) / 2}px at ${w / 2}px ${h / 2}px)`;
        case 'diamond': {
            const cx = w / 2, cy = h / 2;
            return `polygon(${cx}px 0px, ${w}px ${cy}px, ${cx}px ${h}px, 0px ${cy}px)`;
        }
        case 'hexagon': {
            const offset = w * 0.25;
            return `polygon(${offset}px 0px, ${w - offset}px 0px, ${w}px ${h / 2}px, ${w - offset}px ${h}px, ${offset}px ${h}px, 0px ${h / 2}px)`;
        }
        case 'ellipse':
            return `ellipse(${w / 2}px ${h / 2}px at ${w / 2}px ${h / 2}px)`;
        case 'parallelogram': {
            const skew = w * 0.2;
            return `polygon(${skew}px 0px, ${w}px 0px, ${w - skew}px ${h}px, 0px ${h}px)`;
        }
        case 'rectangle':
        default:
            return `inset(0)`;
    }
}

/** Check if a point is inside a given shape. */
export function pointInShape(
    point: Position, shape: NodeShape, bounds: ShapeBounds
): boolean {
    const { x, y, width: w, height: h } = bounds;
    const px = point.x - x;
    const py = point.y - y;

    switch (shape) {
        case 'circle': {
            const r = Math.min(w, h) / 2;
            const dx = px - w / 2;
            const dy = py - h / 2;
            return dx * dx + dy * dy <= r * r;
        }
        case 'diamond': {
            const cx = w / 2, cy = h / 2;
            return Math.abs(px - cx) / cx + Math.abs(py - cy) / cy <= 1;
        }
        case 'hexagon': {
            const cx = w / 2, cy = h / 2;
            const dx = Math.abs(px - cx);
            const dy = Math.abs(py - cy);
            return dy <= cy && dx <= cx && dx + (cx * dy / cy) <= cx * 1.5;
        }
        case 'ellipse': {
            const rx = w / 2, ry = h / 2;
            const dx = px - rx, dy = py - ry;
            return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
        }
        case 'parallelogram': {
            const skew = w * 0.2;
            const leftEdge = skew * (1 - py / h);
            const rightEdge = w - skew * (py / h);
            return px >= leftEdge && px <= rightEdge && py >= 0 && py <= h;
        }
        case 'rectangle':
        default:
            return px >= 0 && px <= w && py >= 0 && py <= h;
    }
}

/** Get the anchor point on a shape's boundary for edge connections. */
export function getShapeAnchor(
    shape: NodeShape, bounds: ShapeBounds,
    targetPoint: Position
): Position {
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;

    if (shape === 'circle' || shape === 'ellipse') {
        const angle = Math.atan2(targetPoint.y - cy, targetPoint.x - cx);
        const rx = bounds.width / 2;
        const ry = shape === 'circle' ? rx : bounds.height / 2;
        return {
            x: cx + rx * Math.cos(angle),
            y: cy + ry * Math.sin(angle)
        };
    }

    // For polygonal shapes, use simple rect anchor as fallback
    const dx = targetPoint.x - cx;
    const dy = targetPoint.y - cy;
    const angle = Math.atan2(dy, dx);
    const hw = bounds.width / 2;
    const hh = bounds.height / 2;

    // Clamp to bounding rectangle
    const absCos = Math.abs(Math.cos(angle));
    const absSin = Math.abs(Math.sin(angle));
    let scale: number;

    if (hw * absSin <= hh * absCos) {
        scale = hw / absCos;
    } else {
        scale = hh / absSin;
    }

    return {
        x: cx + Math.cos(angle) * scale,
        y: cy + Math.sin(angle) * scale
    };
}
