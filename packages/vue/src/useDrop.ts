import { watch } from 'vue';
import type { ShallowRef } from 'vue';
import type { SciFlow, Position } from '@sci-flow/core';
import type { DropNodeData } from '@sci-flow/core';

/**
 * External drag-and-drop integration for Vue.
 *
 * Usage in template:
 * ```vue
 * <div draggable @dragstart="onDragStart({ type: 'processor', title: 'Filter' }, $event)">
 *   Filter Node
 * </div>
 * ```
 */
export function useDrop(
  engine: ShallowRef<SciFlow | null>,
  onDrop?: (position: Position, data: DropNodeData) => void
) {
  watch(engine, (eng) => {
    if (eng && onDrop) eng.plugins.drop.setOnDrop(onDrop);
  }, { immediate: true });

  /** Returns a drag start handler for use in templates. */
  const onDragStart = (data: DropNodeData, e: DragEvent) => {
    e.dataTransfer?.setData('application/sci-flow-node', JSON.stringify(data));
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  };

  return { onDragStart };
}
