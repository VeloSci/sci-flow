import { useCallback } from 'react';
import type { SciFlow, Position } from '@sci-flow/core';
import { easings, type EasingFn } from '@sci-flow/core';

/**
 * Smooth animation helpers for node positions and viewport transitions.
 */
export function useAnimation(engine: SciFlow | null) {
  const animateNodes = useCallback((
    targets: Map<string, Position>,
    duration = 400,
    easing: EasingFn = easings.easeInOut
  ) => {
    if (!engine) return Promise.resolve();
    return engine.plugins.animation.animateNodePositions(targets, duration, easing);
  }, [engine]);

  const animateViewport = useCallback((
    target: { x: number; y: number; zoom: number },
    duration = 300,
    easing: EasingFn = easings.easeInOut
  ) => {
    if (!engine) return Promise.resolve();
    return engine.plugins.animation.animateViewport(target, duration, easing);
  }, [engine]);

  const cancelAnimation = useCallback(() => {
    engine?.plugins.animation.cancel();
  }, [engine]);

  return { animateNodes, animateViewport, cancelAnimation, easings };
}
