import { StateManager } from '../state/StateManager';
import { Node, Edge } from '../types';

export class ShortcutManager {
    constructor(private stateManager: StateManager, private plugins: import('../plugins/PluginHost').PluginHost | undefined) {}

    public handleKeyDown(e: KeyboardEvent): void {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        const state = this.stateManager.getState();

        // Use ShortcutCustomizer if available
        const customizer = this.plugins?.shortcuts;
        if (customizer) {
            const action = customizer.match(e);
            if (action) {
                e.preventDefault();
                switch (action) {
                    case 'selectAll':
                        this.stateManager.setSelection(Array.from(state.nodes.keys()), []);
                        break;
                    case 'delete': {
                        const selectedNodes = Array.from(state.nodes.values()).filter(n => n.selected).map(n => n.id);
                        const selectedEdges = Array.from(state.edges.values()).filter(e => e.selected).map(e => e.id);
                        selectedNodes.forEach(id => this.stateManager.removeNode(id));
                        selectedEdges.forEach(id => this.stateManager.removeEdge(id));
                        break;
                    }
                    case 'undo':
                        this.stateManager.undo();
                        break;
                    case 'redo':
                        this.stateManager.redo();
                        break;
                    case 'fitView':
                        this.plugins?.shortcuts.execute('fitView');
                        break;
                    case 'nudgeUp':
                    case 'nudgeDown':
                    case 'nudgeLeft':
                    case 'nudgeRight': {
                        const selectedNodes = Array.from(state.nodes.values()).filter(n => n.selected);
                        if (selectedNodes.length > 0) {
                            const step = e.shiftKey ? 10 : 1;
                            selectedNodes.forEach(node => {
                                let newX = node.position.x;
                                let newY = node.position.y;
                                if (action === 'nudgeUp') newY -= step;
                                if (action === 'nudgeDown') newY += step;
                                if (action === 'nudgeLeft') newX -= step;
                                if (action === 'nudgeRight') newX += step;
                                this.stateManager.updateNodePosition(node.id, newX, newY, true);
                            });
                            this.stateManager.commitNodePositions();
                            this.stateManager.saveSnapshot();
                        }
                        break;
                    }
                }
                return;
            }
        }

        // Fallback for arrow keys if no customizer
        const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (arrowKeys.includes(e.key)) {
            const selectedNodes = Array.from(state.nodes.values()).filter(n => n.selected);
            if (selectedNodes.length > 0) {
                e.preventDefault();
                const step = e.shiftKey ? 10 : 1;
                selectedNodes.forEach(node => {
                    let newX = node.position.x;
                    let newY = node.position.y;
                    if (e.key === 'ArrowUp') newY -= step;
                    if (e.key === 'ArrowDown') newY += step;
                    if (e.key === 'ArrowLeft') newX -= step;
                    if (e.key === 'ArrowRight') newX += step;
                    this.stateManager.updateNodePosition(node.id, newX, newY, true);
                });
                this.stateManager.commitNodePositions();
                this.stateManager.saveSnapshot();
                return;
            }
        }
    }

    public handleCopy(e: ClipboardEvent): void {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        const state = this.stateManager.getState();
        const selectedNodes = Array.from(state.nodes.values()).filter(n => n.selected);
        const selectedEdges = Array.from(state.edges.values()).filter(e => e.selected);

        if (selectedNodes.length === 0) return;

        const data = { version: 'sci-flow-1.0', nodes: selectedNodes, edges: selectedEdges };
        if (e.clipboardData) {
            e.clipboardData.setData('application/json', JSON.stringify(data));
            e.preventDefault();
        }
    }

    public handlePaste(e: ClipboardEvent): void {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (!e.clipboardData) return;

        try {
            const str = e.clipboardData.getData('application/json');
            if (!str) return;
            const data = JSON.parse(str) as { version: string; nodes: Node[]; edges: Edge[] };
            if (data.version === 'sci-flow-1.0') {
                e.preventDefault();
                // Offset pasted nodes slightly to avoid exact overlap
                const offset = 30;
                const newNodes: Node[] = [];
                const idMap = new Map<string, string>();
                
                data.nodes.forEach((node) => {
                    const newId = `${node.id}-copy-${Date.now()}`;
                    idMap.set(node.id, newId);
                    newNodes.push({
                        ...node,
                        id: newId,
                        position: { x: node.position.x + offset, y: node.position.y + offset },
                        selected: true
                    } as Node);
                });

                // Clear selection first
                this.stateManager.setSelection([], []);
                
                // Add new nodes
                newNodes.forEach(node => this.stateManager.addNode(node));
                
                // Update selection to pasted nodes
                const newNodeIds = newNodes.map(n => n.id);
                this.stateManager.setSelection(newNodeIds, []);
                
                // Save snapshot for undo
                this.stateManager.saveSnapshot();
            }
        } catch (err) {
            console.error('Paste failed', err);
        }
    }
}
