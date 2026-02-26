import { useCallback, useEffect } from 'react';
import type { SciFlow, Position } from '@sci-flow/core';
import type { DropNodeData } from '@sci-flow/core';

/**
 * External drag-and-drop integration for adding nodes from a sidebar palette.
 *
 * Usage:
 * ```tsx
 * const { onDragStart } = useDrop(engine);
 * <div draggable onDragStart={onDragStart({ type: 'processor', title: 'Filter' })}>
 *   Filter Node
 * </div>
 * ```
 */
export function useDrop(
  engine: SciFlow | null,
  onDrop?: (position: Position, data: DropNodeData) => void
) {
  useEffect(() => {
    if (!engine || !onDrop) return;
    engine.plugins.drop.setOnDrop(onDrop);
  }, [engine, onDrop]);

  /** Returns a drag start handler that serializes node data into the drag event. */
  const onDragStart = useCallback((data: DropNodeData) => {
    return (e: React.DragEvent) => {
      e.dataTransfer.setData('application/sci-flow-node', JSON.stringify(data));
      e.dataTransfer.effectAllowed = 'move';
    };
  }, []);

  return { onDragStart };
}
