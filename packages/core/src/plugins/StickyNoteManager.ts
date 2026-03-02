import { StateManager } from '../state/StateManager';

export interface StickyNote {
    id: string;
    text: string;
    position: { x: number; y: number };
    width: number;
    height: number;
    color: string;
    pinned: boolean;
    fontSize?: number;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
    textColor?: string;
    bgOpacity?: number;
}

/** Free-floating text annotations on the canvas. */
export class StickyNoteManager {
    private notes = new Map<string, StickyNote>();
    private stateManager: StateManager;
    private overlayLayer: HTMLDivElement;
    private contextMenu: HTMLDivElement | null = null;

    constructor(container: HTMLElement, stateManager: StateManager) {
        this.stateManager = stateManager;

        // Create the overlay wrapper for notes if it doesn't exist
        let layer = container.querySelector('.sci-flow-notes-layer') as HTMLDivElement;
        if (!layer) {
            layer = document.createElement('div');
            layer.className = 'sci-flow-notes-layer';
            // Important: notes layer scales and pans together with nodes. 
            layer.style.position = 'absolute';
            layer.style.top = '0';
            layer.style.left = '0';
            layer.style.width = '100%';
            layer.style.height = '100%';
            layer.style.pointerEvents = 'none'; // Only the individual notes should catch pointer events
            layer.style.transformOrigin = '0 0';
            layer.style.zIndex = 'var(--sf-z-notes-bg, 5)';
            container.appendChild(layer);
        }
        this.overlayLayer = layer;
    }

    public add(text: string, x: number, y: number, color = '#ffd93d'): StickyNote {
        const id = `note-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
        const note: StickyNote = { id, text, position: { x, y }, width: 200, height: 100, color, pinned: false, fontSize: 13, textColor: '#000000', textAlign: 'left', fontFamily: 'inherit', bgOpacity: 1 };
        this.notes.set(id, note);
        this.reconcile();
        return note;
    }

    public remove(id: string) { this.notes.delete(id); this.reconcile(); }

    public update(id: string, updates: Partial<StickyNote>) {
        const note = this.notes.get(id);
        if (note) { Object.assign(note, updates); this.reconcile(); }
    }

    public move(id: string, x: number, y: number) {
        const note = this.notes.get(id);
        if (note) { note.position = { x, y }; this.reconcile(); }
    }

    public resize(id: string, width: number, height: number) {
        const note = this.notes.get(id);
        if (note) { note.width = width; note.height = height; this.reconcile(); }
    }

    public togglePin(id: string) {
        const note = this.notes.get(id);
        if (note) { note.pinned = !note.pinned; this.reconcile(); }
    }

    public getAll(): StickyNote[] { return [...this.notes.values()]; }
    public get(id: string): StickyNote | undefined { return this.notes.get(id); }
    public clear() { this.notes.clear(); this.reconcile(); }

    public closeContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.remove();
            this.contextMenu = null;
        }
    }

    private showContextMenu(noteId: string, clientX: number, clientY: number) {
        this.closeContextMenu();

        const note = this.notes.get(noteId);
        if (!note) return;

        const menu = document.createElement('div');
        this.contextMenu = menu;
        menu.className = 'sci-flow-sticky-note-context-menu';
        menu.style.position = 'fixed';
        menu.style.left = `${clientX}px`;
        menu.style.top = `${clientY}px`;
        menu.style.zIndex = 'var(--sf-z-ui, 1000)';
        menu.style.background = 'var(--sf-node-bg, #2a2a2a)';
        menu.style.border = '1px solid var(--sf-node-border, #444)';
        menu.style.borderRadius = '6px';
        menu.style.padding = '8px';
        menu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        menu.style.color = '#fff';
        menu.style.fontFamily = 'var(--sf-font, inherit)';
        menu.style.fontSize = '12px';
        menu.style.display = 'flex';
        menu.style.flexDirection = 'column';
        menu.style.gap = '6px';

        menu.innerHTML = `
            <div style="font-weight: 600; font-size: 11px; opacity: 0.7; border-bottom: 1px solid #444; padding-bottom: 4px; margin-bottom: 4px;">Edit Note</div>
            <label style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                Bg Color
                <div style="display: flex; gap: 4px; align-items: center">
                    <input type="range" id="sn-bg-opacity" min="0" max="1" step="0.1" value="${note.bgOpacity ?? 1}" style="width: 40px;">
                    <input type="color" id="sn-bg" value="${note.color.startsWith('#') ? note.color : '#ffd93d'}" style="width: 24px; height: 24px; border: none; background: transparent; cursor: pointer;">
                    <button id="sn-transparent" style="background:transparent; border:1px dashed #666; color:#fff; border-radius:3px; padding: 2px 4px; cursor:pointer; font-size: 10px;">Clear</button>
                </div>
            </label>
            <label style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                Text Color
                <input type="color" id="sn-text" value="${note.textColor || '#000000'}" style="width: 24px; height: 24px; border: none; background: transparent; cursor: pointer;">
            </label>
            <label style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                Font Size
                <input type="number" id="sn-size" value="${note.fontSize || 12}" style="width: 50px; background: #111; border: 1px solid #444; color: #fff; border-radius: 3px; padding: 2px;">
            </label>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 4px;">
                Align
                <div style="display: flex; gap: 4px;">
                    <button id="sn-align-left" style="background:#111; border:1px solid #444; color:#fff; border-radius:3px; padding: 2px 6px; cursor:pointer;">L</button>
                    <button id="sn-align-center" style="background:#111; border:1px solid #444; color:#fff; border-radius:3px; padding: 2px 6px; cursor:pointer;">C</button>
                    <button id="sn-align-right" style="background:#111; border:1px solid #444; color:#fff; border-radius:3px; padding: 2px 6px; cursor:pointer;">R</button>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 4px;">
                Font
                <select id="sn-font" style="width: 80px; background: #111; border: 1px solid #444; color: #fff; border-radius: 3px; padding: 2px;">
                    <option value="inherit">Inherit</option>
                    <option value="monospace">Mono</option>
                    <option value="serif">Serif</option>
                    <option value="sans-serif">Sans</option>
                    <option value="cursive">Cursive</option>
                </select>
            </div>
            <hr style="border: 0; border-top: 1px solid #444; margin: 4px 0;" />
            <button id="sn-delete" style="background:#ff4757; border:none; color:#fff; border-radius:3px; padding: 4px; cursor:pointer; font-weight: bold;">Delete Note</button>
        `;

        const fontSelect = menu.querySelector('#sn-font') as HTMLSelectElement;
        if (note.fontFamily) fontSelect.value = note.fontFamily;

        menu.addEventListener('pointerdown', (e) => e.stopPropagation());
        menu.addEventListener('wheel', (e) => e.stopPropagation(), { passive: false });

        const updater = (changes: Partial<StickyNote>) => {
            this.update(noteId, changes);
            this.stateManager.saveSnapshot();
        };

        menu.querySelector('#sn-bg')?.addEventListener('input', (e) => updater({ color: (e.target as HTMLInputElement).value }));
        menu.querySelector('#sn-bg-opacity')?.addEventListener('input', (e) => updater({ bgOpacity: parseFloat((e.target as HTMLInputElement).value) }));
        menu.querySelector('#sn-transparent')?.addEventListener('click', () => updater({ color: 'transparent', bgOpacity: 0 }));
        menu.querySelector('#sn-text')?.addEventListener('input', (e) => updater({ textColor: (e.target as HTMLInputElement).value }));
        menu.querySelector('#sn-size')?.addEventListener('change', (e) => updater({ fontSize: parseInt((e.target as HTMLInputElement).value, 10) }));
        menu.querySelector('#sn-align-left')?.addEventListener('click', () => updater({ textAlign: 'left' }));
        menu.querySelector('#sn-align-center')?.addEventListener('click', () => updater({ textAlign: 'center' }));
        menu.querySelector('#sn-align-right')?.addEventListener('click', () => updater({ textAlign: 'right' }));
        menu.querySelector('#sn-font')?.addEventListener('change', (e) => updater({ fontFamily: (e.target as HTMLSelectElement).value }));
        menu.querySelector('#sn-delete')?.addEventListener('click', () => {
            this.remove(noteId);
            this.stateManager.saveSnapshot();
            this.closeContextMenu();
        });

        const closeHandler = () => {
            this.closeContextMenu();
            window.removeEventListener('pointerdown', closeHandler);
        };
        setTimeout(() => window.addEventListener('pointerdown', closeHandler), 0);
        document.body.appendChild(menu);
    }

    public reconcile() {
        const state = this.stateManager.getState();
        const transform = `translate(${state.viewport.x}px, ${state.viewport.y}px) scale(${state.viewport.zoom})`;
        this.overlayLayer.style.transform = transform;

        const existingIds = new Set(Array.from(this.overlayLayer.children).map(c => c.id));

        for (const [id, note] of this.notes.entries()) {
            let el = document.getElementById(id) as HTMLDivElement;
            if (!el) {
                el = document.createElement('div');
                el.id = id;
                el.dataset.itemId = id;
                el.className = 'sci-flow-sticky-note';

                // Allow interaction on the note container, but delegate drag to DragManager
                el.style.position = 'absolute';
                el.style.pointerEvents = 'all';
                el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                el.style.borderRadius = '4px';
                el.style.padding = '8px';
                el.style.display = 'flex';
                el.style.flexDirection = 'column';
                el.style.cursor = 'grab';


                // Dynamic z-index hover functionality
                el.addEventListener('pointerenter', () => {
                    if (el.dataset.dragging !== 'true') {
                        this.overlayLayer.style.zIndex = 'var(--sf-z-notes-fg, 50)';
                    }
                });
                el.addEventListener('pointerleave', () => {
                    if (el.dataset.dragging !== 'true') {
                        this.overlayLayer.style.zIndex = 'var(--sf-z-notes-bg, 5)';
                    }
                });
                // Pointer down forces elevation immediately and locks it until released
                el.addEventListener('pointerdown', () => {
                    el.dataset.dragging = 'true';
                    this.overlayLayer.style.zIndex = 'var(--sf-z-notes-fg, 50)';
                    const upHandler = () => {
                        el.dataset.dragging = 'false';
                        this.overlayLayer.style.zIndex = 'var(--sf-z-notes-bg, 5)';
                        window.removeEventListener('pointerup', upHandler);
                    };
                    window.addEventListener('pointerup', upHandler);
                });
                // Open Context Menu on right click
                el.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.showContextMenu(id, e.clientX, e.clientY);
                });

                const textarea = document.createElement('textarea');
                textarea.className = 'sci-flow-note-input';
                textarea.style.flex = '1';
                textarea.style.background = 'transparent';
                textarea.style.border = 'none';
                textarea.style.resize = 'none';
                textarea.style.outline = 'none';
                textarea.style.cursor = 'text';

                // Prevent pointerdown from bubbling and starting drag when clicking the text
                textarea.addEventListener('pointerdown', e => e.stopPropagation());
                textarea.addEventListener('input', (e) => {
                    this.update(id, { text: (e.target as HTMLTextAreaElement).value });
                });

                el.appendChild(textarea);
                this.overlayLayer.appendChild(el);
            }

            const textarea = el.querySelector('textarea.sci-flow-note-input') as HTMLTextAreaElement;
            if (textarea) {
                if (textarea.value !== note.text) textarea.value = note.text;
                textarea.style.fontFamily = note.fontFamily || 'var(--sf-font, inherit)';
                textarea.style.fontSize = `${note.fontSize || 12}px`;
                textarea.style.color = note.textColor || '#000000';
                textarea.style.textAlign = note.textAlign || 'left';
            }

            el.style.left = `${note.position.x}px`;
            el.style.top = `${note.position.y}px`;
            el.style.width = `${note.width}px`;
            el.style.height = `${note.height}px`;

            // Apply color. If it's hex, convert/mix with bgOpacity. 
            // If it's already rgba/hsla/named, use it directly.
            const color = note.color.trim();
            if (color.startsWith('#')) {
                const hex = color.replace('#', '');
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                const alpha = note.bgOpacity !== undefined ? note.bgOpacity : 1;
                el.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            } else {
                el.style.backgroundColor = color;
                // If direct color is used, we might still want to apply opacity if it's set and the color doesn't have it
                if (note.bgOpacity !== undefined && note.bgOpacity < 1 && !color.includes('rgba') && !color.includes('hsla')) {
                    el.style.opacity = (parseFloat(el.style.opacity || '1') * note.bgOpacity).toString();
                }
            }

            // Keep pinned opacity as overall lowering if pinned
            if (note.pinned) {
                el.style.opacity = (parseFloat(el.style.opacity || '1') * 0.7).toString();
            }

            existingIds.delete(id);
        }

        // Remove deleted notes
        for (const id of existingIds) {
            document.getElementById(id)?.remove();
        }
    }
}
