import { ref } from 'vue';
import type { ShallowRef } from 'vue';
import type { SciFlow, SearchResult } from '@sci-flow/core';

/** Node search & filter for Vue. */
export function useSearch(engine: ShallowRef<SciFlow | null>) {
  const results = ref<SearchResult[]>([]);

  const search = (query: string) => {
    const r = engine.value?.plugins.search.search(query) ?? [];
    results.value = r;
    return r;
  };
  const filterByType = (type: string) => {
    const r = engine.value?.plugins.search.filterByType(type) ?? [];
    results.value = r;
    return r;
  };
  const clearHighlights = () => { engine.value?.plugins.search.clearHighlights(); results.value = []; };
  const isHighlighted = (nodeId: string) => engine.value?.plugins.search.isHighlighted(nodeId) ?? false;

  return { search, filterByType, clearHighlights, isHighlighted, results };
}
