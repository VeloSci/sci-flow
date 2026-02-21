import { Node } from '../types';

/**
 * Returns an array of all descendant node IDs for a given list of parent IDs.
 */
export function getDescendants(nodes: Map<string, Node>, parentIds: string[]): string[] {
    const descendants = new Set<string>();
    const parentsToProcess = [...parentIds];

    while (parentsToProcess.length > 0) {
        const currentParent = parentsToProcess.pop()!;
        
        for (const [nodeId, node] of nodes.entries()) {
            if (node.parentId === currentParent && !descendants.has(nodeId)) {
                descendants.add(nodeId);
                parentsToProcess.push(nodeId);
            }
        }
    }

    return Array.from(descendants);
}
