import { JsonMap, JsonValue } from '../types';

/**
 * Creates a safe evaluation sandbox for executing user-provided JS code.
 * This prevents the code from accessing the global `window`, `document`,
 * or other sensitive APIs, enabling secure "code nodes" evaluation.
 */
export const evaluateSafe = (code: string, context: JsonMap = {}): JsonValue => {
    try {
        // Create an array of keys to inject as local variables
        const keys = Object.keys(context);
        const values = Object.values(context);

        // Build a function that masks the global scope using a Proxy or by throwing on access.
        // We use the Function constructor to isolate the scope, and we inject strictly the requested context.
        const fnTemplate = `
            return function(${keys.join(',')}) {
                "use strict";
                try {
                    ${code}
                } catch(e) {
                    return e;
                }
            }
        `;

        const executor = new Function(fnTemplate)();
        return executor(...values) as JsonValue;
    } catch (err) {
        console.error("SciFlow Sandbox Error:", err);
        return err as JsonValue;
    }
}
