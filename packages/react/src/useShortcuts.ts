import { useCallback } from 'react';
import type { SciFlow, ShortcutAction, ShortcutBinding } from '@sci-flow/core';

/** Keyboard shortcut customization. */
export function useShortcuts(engine: SciFlow | null) {
  const setShortcut = useCallback((action: ShortcutAction, binding: ShortcutBinding) => {
    engine?.plugins.shortcuts.setShortcut(action, binding);
  }, [engine]);

  const onAction = useCallback((action: ShortcutAction, handler: () => void) => {
    engine?.plugins.shortcuts.onAction(action, handler);
  }, [engine]);

  const getBinding = useCallback((action: ShortcutAction) => {
    return engine?.plugins.shortcuts.getBinding(action);
  }, [engine]);

  const getAllBindings = useCallback(() => {
    return engine?.plugins.shortcuts.getAllBindings() ?? new Map();
  }, [engine]);

  return { setShortcut, onAction, getBinding, getAllBindings };
}
