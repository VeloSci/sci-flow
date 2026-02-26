export type ShortcutAction = 'delete' | 'selectAll' | 'copy' | 'paste' | 'undo' | 'redo'
  | 'nudgeUp' | 'nudgeDown' | 'nudgeLeft' | 'nudgeRight' | 'fitView' | 'escape'
  | string; // allow custom actions

export interface ShortcutBinding {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
}

/** Customizable keyboard shortcut manager. */
export class ShortcutCustomizer {
    private bindings = new Map<ShortcutAction, ShortcutBinding>();
    private handlers = new Map<ShortcutAction, () => void>();

    constructor() {
        this.loadDefaults();
    }

    private loadDefaults() {
        this.bindings.set('delete', { key: 'Delete' });
        this.bindings.set('selectAll', { key: 'a', ctrl: true });
        this.bindings.set('copy', { key: 'c', ctrl: true });
        this.bindings.set('paste', { key: 'v', ctrl: true });
        this.bindings.set('undo', { key: 'z', ctrl: true });
        this.bindings.set('redo', { key: 'y', ctrl: true });
        this.bindings.set('nudgeUp', { key: 'ArrowUp' });
        this.bindings.set('nudgeDown', { key: 'ArrowDown' });
        this.bindings.set('nudgeLeft', { key: 'ArrowLeft' });
        this.bindings.set('nudgeRight', { key: 'ArrowRight' });
        this.bindings.set('fitView', { key: 'f' });
        this.bindings.set('escape', { key: 'Escape' });
    }

    /** Override a shortcut binding. */
    public setShortcut(action: ShortcutAction, binding: ShortcutBinding) {
        this.bindings.set(action, binding);
    }

    /** Register a handler for an action. */
    public onAction(action: ShortcutAction, handler: () => void) {
        this.handlers.set(action, handler);
    }

    /** Match a keyboard event to a registered action. */
    public match(e: KeyboardEvent): ShortcutAction | null {
        for (const [action, binding] of this.bindings) {
            if (e.key === binding.key
                && !!e.ctrlKey === !!binding.ctrl
                && !!e.shiftKey === !!binding.shift
                && !!e.altKey === !!binding.alt
                && !!e.metaKey === !!binding.meta) {
                return action;
            }
        }
        return null;
    }

    /** Execute the handler for a matched action. */
    public execute(action: ShortcutAction): boolean {
        const handler = this.handlers.get(action);
        if (handler) { handler(); return true; }
        return false;
    }

    /** Handle a keyboard event end-to-end: match + execute. */
    public handleKeyDown(e: KeyboardEvent): boolean {
        const action = this.match(e);
        if (action) return this.execute(action);
        return false;
    }

    public getBinding(action: ShortcutAction): ShortcutBinding | undefined {
        return this.bindings.get(action);
    }

    public getAllBindings(): Map<ShortcutAction, ShortcutBinding> {
        return new Map(this.bindings);
    }
}
