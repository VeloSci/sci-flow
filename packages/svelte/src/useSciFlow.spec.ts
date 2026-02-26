import { describe, it, expect } from 'vitest';
import { useSciFlow } from './useSciFlow';

describe('useSciFlow (Svelte)', () => {
    it('should be exported correctly', () => {
        expect(useSciFlow).toBeDefined();
        expect(typeof useSciFlow).toBe('function');
    });
});
