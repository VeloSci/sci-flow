import type { ShallowRef } from 'vue';
import type { SciFlow, Position } from '@sci-flow/core';
import { easings, type EasingFn } from '@sci-flow/core';

/**
 * Smooth animation helpers for Vue adapter.
 */
export function useAnimation(engine: ShallowRef<SciFlow | null>) {
  const animateNodes = (
    targets: Map<string, Position>,
    duration = 400,
    easing: EasingFn = easings.easeInOut
  ) => {
    if (!engine.value) return Promise.resolve();
    return engine.value.plugins.animation.animateNodePositions(targets, duration, easing);
  };

  const animateViewport = (
    target: { x: number; y: number; zoom: number },
    duration = 300,
    easing: EasingFn = easings.easeInOut
  ) => {
    if (!engine.value) return Promise.resolve();
    return engine.value.plugins.animation.animateViewport(target, duration, easing);
  };

  const cancelAnimation = () => engine.value?.plugins.animation.cancel();

  return { animateNodes, animateViewport, cancelAnimation, easings };
}
