import type { ShallowRef } from 'vue';
import type { SciFlow, ShortcutAction, ShortcutBinding } from '@sci-flow/core';

/** Keyboard shortcut customization for Vue. */
export function useShortcuts(engine: ShallowRef<SciFlow | null>) {
  const setShortcut = (action: ShortcutAction, binding: ShortcutBinding) =>
    engine.value?.plugins.shortcuts.setShortcut(action, binding);
  const onAction = (action: ShortcutAction, handler: () => void) =>
    engine.value?.plugins.shortcuts.onAction(action, handler);
  const getBinding = (action: ShortcutAction) =>
    engine.value?.plugins.shortcuts.getBinding(action);
  const getAllBindings = () =>
    engine.value?.plugins.shortcuts.getAllBindings() ?? new Map();
  return { setShortcut, onAction, getBinding, getAllBindings };
}
