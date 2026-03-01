import { describe, it, expect } from 'vitest';
import { getStraightPath, getBezierPath, getStepPath } from './edges';

describe('Edge Utilities', () => {
    describe('getStraightPath', () => {
        it('calculates straight line between two points', () => {
            const path = getStraightPath({ x: 0, y: 0 }, { x: 100, y: 100 });
            expect(path).toBe('M 0,0 L 100,100');
        });
    });

    describe('getBezierPath', () => {
        it('calculates bezier curve between two points with default curvature', () => {
            const path = getBezierPath({ x: 0, y: 50 }, { x: 100, y: 50 });
            // cx = (100 - 0) * 0.25 = 25
            // x1=0, y1=50, c1x=25, c1y=50, c2x=75, c2y=50, x2=100, y2=50
            expect(path).toBe('M 0,50 C 25,50 75,50 100,50');
        });
    });

    describe('getStepPath', () => {
        it('calculates non-rounded stepped orthogonal path', () => {
            const path = getStepPath({ x: 0, y: 0 }, { x: 100, y: 100 }, 0, 30);
            // Expected: dropX = 30
            // M 0,0 L 30,0 L 30,100 L 100,100
            expect(path).toBe('M 0,0 L 30,0 L 30,100 L 100,100');
        });

        it('calculates stepped path for backwards routing', () => {
            const path = getStepPath({ x: 100, y: 0 }, { x: 0, y: 100 }, 0, 30);
            // target.x (0) <= dropX (130) -> isBackwards = true
            // midY = 0 + 100 / 2 = 50
            // targetPaddingX = -30
            // Path: M 100,0 L 130,0 L 130,50 L -30,50 L -30,100 L 0,100
            expect(path).toBe('M 100,0 L 130,0 L 130,50 L -30,50 L -30,100 L 0,100');
        });

        it('calculates rounded stepped orthogonal path', () => {
            // Forward pass rounded
            const path = getStepPath({ x: 0, y: 0 }, { x: 100, y: 100 }, 10, 30);
            // Drop target x>source x
            expect(path).toContain('A 10,10 0 0 1'); // Arc 1
            expect(path).toContain('A 10,10 0 0 0'); // Arc 2
        });
    });
});
