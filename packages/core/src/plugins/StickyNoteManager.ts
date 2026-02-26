export interface StickyNote {
    id: string;
    text: string;
    position: { x: number; y: number };
    width: number;
    height: number;
    color: string;
    pinned: boolean;
}

/** Free-floating text annotations on the canvas. */
export class StickyNoteManager {
    private notes = new Map<string, StickyNote>();

    public add(text: string, x: number, y: number, color = '#ffd93d'): StickyNote {
        const id = `note-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
        const note: StickyNote = { id, text, position: { x, y }, width: 200, height: 100, color, pinned: false };
        this.notes.set(id, note);
        return note;
    }

    public remove(id: string) { this.notes.delete(id); }

    public update(id: string, updates: Partial<StickyNote>) {
        const note = this.notes.get(id);
        if (note) Object.assign(note, updates);
    }

    public move(id: string, x: number, y: number) {
        const note = this.notes.get(id);
        if (note) note.position = { x, y };
    }

    public resize(id: string, width: number, height: number) {
        const note = this.notes.get(id);
        if (note) { note.width = width; note.height = height; }
    }

    public togglePin(id: string) {
        const note = this.notes.get(id);
        if (note) note.pinned = !note.pinned;
    }

    public getAll(): StickyNote[] { return [...this.notes.values()]; }
    public get(id: string): StickyNote | undefined { return this.notes.get(id); }
    public clear() { this.notes.clear(); }
}
