import { HistoryManager, type HistoryAction } from '../state/HistoryManager';

export interface PersistenceOptions {
    key: string;
    maxDepth: number;
    storage: 'localStorage' | 'sessionStorage';
}

/** Persists undo/redo history to localStorage/sessionStorage. */
export class HistoryPersistence {
    private key: string;
    private maxDepth: number;
    private storage: Storage;

    constructor(
        private historyManager: HistoryManager,
        options?: Partial<PersistenceOptions>
    ) {
        this.key = options?.key || 'sci-flow-history';
        this.maxDepth = options?.maxDepth || 100;
        this.storage = options?.storage === 'sessionStorage'
            ? sessionStorage : localStorage;
    }

    /** Save current history stack to storage. */
    public save() {
        try {
            const data = this.historyManager.serialize();
            const trimmed = data.slice(-this.maxDepth);
            this.storage.setItem(this.key, JSON.stringify(trimmed));
        } catch { /* quota exceeded — silently fail */ }
    }

    /** Restore history from storage. */
    public restore(): boolean {
        try {
            const raw = this.storage.getItem(this.key);
            if (!raw) return false;
            const actions: HistoryAction[] = JSON.parse(raw);
            this.historyManager.deserialize(actions);
            return true;
        } catch { return false; }
    }

    /** Clear persisted history. */
    public clear() {
        this.storage.removeItem(this.key);
    }

    /** Auto-save after each action (call from history change listener). */
    public enableAutoSave() {
        this.historyManager.onAction(() => this.save());
    }
}
