import { describe, it, expect } from 'vitest';
import { getSmartOrthogonalPath } from './routing';

describe('Routing Utilities (A*)', () => {
    describe('getSmartOrthogonalPath', () => {
        it('calculates a basic step path when no obstacles are present', () => {
            const path = getSmartOrthogonalPath({ x: 0, y: 0 }, { x: 100, y: 100 }, [], 20);
            // Fallback path expects to use the step logic with padding 20
            // dropX = 20
            // M 0,0 L 20,0 L 20,100 L 100,100
            expect(path).toBe('M 0,0 L 20,0 L 20,100 L 100,100');
        });

        it('routes around an obstacle successfully', () => {
            // Place an obstacle directly in the step path (e.g. at x: 20, y: 50)
            const obs = [{ id: 'obs1', x: 10, y: 40, width: 30, height: 30 }];
            
            // Expected to find an A* route that navigates around the obstacle
            // The path won't precisely be the simple fallback.
            const path = getSmartOrthogonalPath({ x: 0, y: 0 }, { x: 100, y: 100 }, obs, 20);
            
            // Should contain multiple line segments avoiding the obstacle.
            expect(path).not.toBe('M 0,0 L 20,0 L 20,100 L 100,100');
            expect(path.startsWith('M 0,0')).toBe(true);
            expect(path.endsWith('100,100')).toBe(true);
        });
    });
});
