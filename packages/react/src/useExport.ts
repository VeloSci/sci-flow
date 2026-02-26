import { useCallback } from 'react';
import type { SciFlow } from '@sci-flow/core';

/**
 * Export/download helpers for the SciFlow graph.
 */
export function useExport(engine: SciFlow | null) {
  const downloadPNG = useCallback(async (filename = 'flow') => {
    if (!engine) return;
    await engine.plugins.exporter.download(filename, 'png');
  }, [engine]);

  const downloadSVG = useCallback(async (filename = 'flow') => {
    if (!engine) return;
    await engine.plugins.exporter.download(filename, 'svg');
  }, [engine]);

  const downloadJSON = useCallback(async (filename = 'flow') => {
    if (!engine) return;
    await engine.plugins.exporter.download(filename, 'json');
  }, [engine]);

  const toSVGString = useCallback(() => {
    if (!engine) return '';
    return engine.plugins.exporter.toSVG();
  }, [engine]);

  const toPNGBlob = useCallback(async (scale = 2) => {
    if (!engine) return null;
    return engine.plugins.exporter.toPNG(scale);
  }, [engine]);

  return { downloadPNG, downloadSVG, downloadJSON, toSVGString, toPNGBlob };
}
