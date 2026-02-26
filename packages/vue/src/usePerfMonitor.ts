import type { ShallowRef } from 'vue';
import type { SciFlow } from '@sci-flow/core';

/** Performance monitor for Vue. */
export function usePerfMonitor(engine: ShallowRef<SciFlow | null>) {
  const show = () => engine.value?.plugins.perfMonitor.show();
  const hide = () => engine.value?.plugins.perfMonitor.hide();
  const toggle = () => engine.value?.plugins.perfMonitor.toggle();
  const getFPS = () => engine.value?.plugins.perfMonitor.getFPS() ?? 0;
  const isVisible = () => engine.value?.plugins.perfMonitor.isVisible() ?? false;
  return { show, hide, toggle, getFPS, isVisible };
}
