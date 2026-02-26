import { useCallback, useState } from 'react';
import type { SciFlow, SearchResult } from '@sci-flow/core';

/** Node search & filter controls. */
export function useSearch(engine: SciFlow | null) {
  const [results, setResults] = useState<SearchResult[]>([]);

  const search = useCallback((query: string) => {
    if (!engine) { setResults([]); return []; }
    const r = engine.plugins.search.search(query);
    setResults(r);
    return r;
  }, [engine]);

  const filterByType = useCallback((type: string) => {
    if (!engine) { setResults([]); return []; }
    const r = engine.plugins.search.filterByType(type);
    setResults(r);
    return r;
  }, [engine]);

  const clearHighlights = useCallback(() => {
    engine?.plugins.search.clearHighlights();
    setResults([]);
  }, [engine]);

  const isHighlighted = useCallback((nodeId: string) => {
    return engine?.plugins.search.isHighlighted(nodeId) ?? false;
  }, [engine]);

  return { search, filterByType, clearHighlights, isHighlighted, results };
}
