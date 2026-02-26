import { computed } from 'vue';
import type { ShallowRef } from 'vue';
import type { SciFlow } from '@sci-flow/core';

/**
 * Access all plugin managers from the SciFlow engine.
 */
export function usePlugins(engine: ShallowRef<SciFlow | null>) {
  return computed(() => engine.value?.plugins ?? null);
}
