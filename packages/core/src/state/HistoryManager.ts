import { FlowState } from '../types';

export class HistoryManager {
    private history: string[] = [];
    private historyIndex: number = -1;
    private maxHistory: number = 50;
    private isRestoringHistory: boolean = false;

    constructor() {}

    public saveSnapshot(state: FlowState) {
        if (this.isRestoringHistory) return;

        const snapshot = JSON.stringify({
            nodes: Array.from(state.nodes.entries()),
            edges: Array.from(state.edges.entries())
        });

        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        if (this.history.length > 0 && this.history[this.historyIndex] === snapshot) {
            return;
        }

        this.history.push(snapshot);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    public undo(restore: (snapshot: string) => void) {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.performRestore(this.history[this.historyIndex], restore);
        }
    }

    public redo(restore: (snapshot: string) => void) {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.performRestore(this.history[this.historyIndex], restore);
        }
    }

    private performRestore(snapshot: string, restore: (snapshot: string) => void) {
        this.isRestoringHistory = true;
        restore(snapshot);
        this.isRestoringHistory = false;
    }
}
