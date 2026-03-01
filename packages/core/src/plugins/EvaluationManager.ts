import { StateManager } from '../state/StateManager';
import { JsonMap, JsonValue } from '../types';
import { evaluateSafe } from '../utils/sandbox';

/** Evaluates the graph as a data pipeline using topological sort. */
export class EvaluationManager {
    constructor(private stateManager: StateManager) {}

    /** Execute a full evaluation pass over the graph. */
    public evaluate(): Map<string, JsonMap> {
        const state = this.stateManager.getState();
        const sorted = this.topologicalSort();
        const nodeOutputs = new Map<string, JsonMap>();

        for (const nodeId of sorted) {
            const node = state.nodes.get(nodeId);
            if (!node) continue;

            // Gather inputs from connected edges
            const inputs: JsonMap = {};
            for (const [portId] of Object.entries(node.inputs)) {
                // Find edge targeting this port
                for (const edge of state.edges.values()) {
                    if (edge.target === nodeId && edge.targetHandle === portId) {
                        const sourceOutputs = nodeOutputs.get(edge.source);
                        if (sourceOutputs && edge.sourceHandle in sourceOutputs) {
                            inputs[portId] = sourceOutputs[edge.sourceHandle];
                        }
                    }
                }
                // Fallback to default value
                if (!(portId in inputs) && node.inputs[portId]?.defaultValue != null) {
                    inputs[portId] = node.inputs[portId].defaultValue as JsonValue;
                }
            }

            // Evaluate the node
            let outputs: JsonMap = {};
            const registry = this.stateManager.getNodeRegistry();
            const def = registry.get(node.type);

            if (def?.evaluate) {
                outputs = def.evaluate(inputs, node.data);
            } else if (node.logicCode) {
                const result = evaluateSafe(node.logicCode, { ...inputs, ...node.data });
                if (result && typeof result === 'object' && !Array.isArray(result)) {
                    outputs = result as JsonMap;
                }
            } else {
                // Pass-through: copy inputs to outputs intelligently
                const inKeys = Object.keys(inputs);
                const outKeys = Object.keys(node.outputs);
                
                if (inKeys.length === 1 && outKeys.length === 1) {
                    // Single input -> Single output
                    outputs[outKeys[0]] = inputs[inKeys[0]];
                } else {
                    // Match by name or index
                    outKeys.forEach((outId, idx) => {
                        if (outId in inputs) {
                            outputs[outId] = inputs[outId];
                        } else if (inKeys[idx] !== undefined) {
                            outputs[outId] = inputs[inKeys[idx]];
                        }
                    });
                }
            }

            nodeOutputs.set(nodeId, outputs);
        }

        return nodeOutputs;
    }

    /** Topological sort using Kahn's algorithm. */
    private topologicalSort(): string[] {
        const state = this.stateManager.getState();
        const inDegree = new Map<string, number>();
        const adjacency = new Map<string, string[]>();

        state.nodes.forEach((_, id) => {
            inDegree.set(id, 0);
            adjacency.set(id, []);
        });

        state.edges.forEach(edge => {
            adjacency.get(edge.source)?.push(edge.target);
            inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
        });

        const queue: string[] = [];
        inDegree.forEach((deg, id) => { if (deg === 0) queue.push(id); });

        const sorted: string[] = [];
        while (queue.length > 0) {
            const current = queue.shift()!;
            sorted.push(current);
            for (const neighbor of adjacency.get(current) || []) {
                const newDeg = (inDegree.get(neighbor) || 1) - 1;
                inDegree.set(neighbor, newDeg);
                if (newDeg === 0) queue.push(neighbor);
            }
        }

        return sorted;
    }
}
