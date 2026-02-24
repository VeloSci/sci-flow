import { onMount } from 'svelte';
import { SciFlow, type SciFlowOptions, type FlowState } from '@sci-flow/core';
import { writable, type Writable } from 'svelte/store';

export function useSciFlow(options: SciFlowOptions) {
    const state: Writable<FlowState | null> = writable(null);
    let instance: SciFlow | null = null;

    onMount(() => {
        instance = new SciFlow(options);
        state.set(instance.getState());

        const unsubscribe = instance.subscribe((newState: FlowState) => {
            state.set(newState);
        });

        return () => {
            unsubscribe();
            instance?.destroy();
        };
    });

    return {
        state,
        getInstance: () => instance
    };
}
