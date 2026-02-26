import type { ShallowRef } from 'vue';
import type { SciFlow } from '@sci-flow/core';

/**
 * Export/download helpers for Vue.
 */
export function useExport(engine: ShallowRef<SciFlow | null>) {
  const downloadPNG = async (filename = 'flow') => {
    await engine.value?.plugins.exporter.download(filename, 'png');
  };

  const downloadSVG = async (filename = 'flow') => {
    await engine.value?.plugins.exporter.download(filename, 'svg');
  };

  const downloadJSON = async (filename = 'flow') => {
    await engine.value?.plugins.exporter.download(filename, 'json');
  };

  const toSVGString = () => engine.value?.plugins.exporter.toSVG() ?? '';

  const toPNGBlob = async (scale = 2) => {
    return engine.value?.plugins.exporter.toPNG(scale) ?? null;
  };

  return { downloadPNG, downloadSVG, downloadJSON, toSVGString, toPNGBlob };
}
