import { describe, it, expect } from 'vitest';
import { doRectsIntersect, getCenter, pointInRect, distance } from './geometry';

describe('Geometry Utils', () => {
  it('should correctly calculate rect intersection', () => {
    const r1 = { x: 0, y: 0, width: 100, height: 100 };
    const r2 = { x: 50, y: 50, width: 100, height: 100 };
    const r3 = { x: 150, y: 150, width: 100, height: 100 };

    expect(doRectsIntersect(r1, r2)).toBe(true);
    expect(doRectsIntersect(r1, r3)).toBe(false);
  });

  it('should correctly calculate the center of a rect', () => {
    const rect = { x: 10, y: 20, width: 200, height: 100 };
    expect(getCenter(rect)).toEqual({ x: 110, y: 70 });
  });

  it('should correctly identify if a point is within a rect', () => {
    const rect = { x: 0, y: 0, width: 100, height: 100 };
    expect(pointInRect({ x: 50, y: 50 }, rect)).toBe(true);
    expect(pointInRect({ x: -10, y: 50 }, rect)).toBe(false);
  });

  it('should calculate distance correctly', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5); // 3-4-5 triangle
    expect(distance({ x: -1, y: -1 }, { x: -1, y: -1 })).toBe(0);
  });
});
