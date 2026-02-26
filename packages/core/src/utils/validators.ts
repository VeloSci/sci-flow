import { Connection, FlowState } from '../types';

/** Pluggable connection validation system. */
export type ConnectionValidator = (
    connection: Connection,
    state: FlowState
) => boolean;

/** Built-in: Prevent self-connections (same node). */
export const preventSelfLoop: ConnectionValidator = (conn) =>
    conn.source !== conn.target;

/** Built-in: Prevent duplicate edges between same ports. */
export const preventDuplicateEdge: ConnectionValidator = (conn, state) => {
    for (const edge of state.edges.values()) {
        if (
            edge.source === conn.source &&
            edge.target === conn.target &&
            edge.sourceHandle === conn.sourceHandle &&
            edge.targetHandle === conn.targetHandle
        ) return false;
    }
    return true;
};

/** Built-in: Prevent cycles in the graph. */
export const preventCycles: ConnectionValidator = (conn, state) => {
    const visited = new Set<string>();
    const queue = [conn.target];
    while (queue.length > 0) {
        const current = queue.shift()!;
        if (current === conn.source) return false;
        if (visited.has(current)) continue;
        visited.add(current);
        for (const edge of state.edges.values()) {
            if (edge.source === current) queue.push(edge.target);
        }
    }
    return true;
};

/** Built-in: Enforce max connections per port. */
export const enforceConnectionLimit = (maxPerPort: number): ConnectionValidator =>
    (conn, state) => {
        let sourceCount = 0;
        let targetCount = 0;
        for (const edge of state.edges.values()) {
            if (edge.source === conn.source && edge.sourceHandle === conn.sourceHandle) sourceCount++;
            if (edge.target === conn.target && edge.targetHandle === conn.targetHandle) targetCount++;
        }
        return sourceCount < maxPerPort && targetCount < maxPerPort;
    };

/** Compose multiple validators into one (all must pass). */
export const composeValidators = (...validators: ConnectionValidator[]): ConnectionValidator =>
    (conn, state) => validators.every(v => v(conn, state));
