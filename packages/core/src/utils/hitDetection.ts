import { Position } from '../types';

/**
 * Calculates distance from a point to a line segment (straight edge hit detection)
 */
export const distanceToLineSegment = (p: Position, a: Position, b: Position): number => {
    const l2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    if (l2 === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
    let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.sqrt((p.x - (a.x + t * (b.x - a.x))) ** 2 + (p.y - (a.y + t * (b.y - a.y))) ** 2);
};

/**
 * Calculates approximate closest distance to a cubic bezier curve using look-up increments.
 * Highly optimized for 60fps hit detection.
 */
export const distanceToBezier = (p: Position, a: Position, b: Position, controlPointRatio = 0.5): number => {
     // A cubic bezier is P = (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)t^2*P2 + t^3*P3
     const cx = (b.x - a.x) * controlPointRatio;
     const p1 = { x: a.x + cx, y: a.y };
     const p2 = { x: b.x - cx, y: b.y };
     
     let minDist = Infinity;
     const steps = 20; // Resolution for hit detection
     
     for (let i = 0; i <= steps; i++) {
         const t = i / steps;
         const mt = 1 - t;
         
         const qx = mt*mt*mt*a.x + 3*mt*mt*t*p1.x + 3*mt*t*t*p2.x + t*t*t*b.x;
         const qy = mt*mt*mt*a.y + 3*mt*mt*t*p1.y + 3*mt*t*t*p2.y + t*t*t*b.y;
         
         const dist = Math.sqrt((p.x - qx) ** 2 + (p.y - qy) ** 2);
         if (dist < minDist) {
             minDist = dist;
         }
     }
     
     return minDist;
};
