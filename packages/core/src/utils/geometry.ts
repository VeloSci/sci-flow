import { Position, Rect } from '../types';

export const doRectsIntersect = (r1: Rect, r2: Rect): boolean => {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
};

export const getCenter = (rect: Rect): Position => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2,
});

export const pointInRect = (p: Position, r: Rect): boolean => {
  return p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height;
};

// Map a viewport string coordinate back to local canvas coordinate
export const screenToFlowPosition = (
    screenPos: Position,
    viewportContentRect: DOMRect,
    zoom: number,
    pan: Position
): Position => {
    return {
        x: (screenPos.x - viewportContentRect.left - pan.x) / zoom,
        y: (screenPos.y - viewportContentRect.top - pan.y) / zoom,
    }
};

// Basic distance calculation
export const distance = (p1: Position, p2: Position): number => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}
