<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { SciFlow, type SciFlowOptions, type Node, type Edge, type FlowState } from '@sci-flow/core';

  export let nodes: Node[] = [];
  export let edges: Edge[] = [];
  export let options: Omit<SciFlowOptions, 'container'> = {};
  export let theme: SciFlowOptions['theme'] = 'light';
  export let nodeTypes: Record<string, any> = {};

  const dispatch = createEventDispatcher();
  let container: HTMLDivElement;
  let engine: SciFlow;
  let portalMounts = new Map<string, HTMLElement>();

  onMount(() => {
    engine = new SciFlow({
      ...options,
      container,
      theme
    });

    const stateManager = (engine as any).stateManager;
    if (stateManager) {
        stateManager.onNodeMount = (nodeId: string, domElement: HTMLElement) => {
            portalMounts.set(nodeId, domElement);
            portalMounts = new Map(portalMounts);
        };
        stateManager.onNodeUnmount = (nodeId: string) => {
            portalMounts.delete(nodeId);
            portalMounts = new Map(portalMounts);
        };
    }

    engine.setNodes(nodes);
    engine.setEdges(edges);

    const unsubscribe = engine.subscribe((state: FlowState) => {
        dispatch('change', state);
    });

    dispatch('init', engine);

    return () => {
      unsubscribe();
      engine.destroy();
    };
  });

  // Reactive updates
  $: if (engine && nodes) engine.setNodes(nodes);
  $: if (engine && edges) engine.setEdges(edges);
  $: if (engine && theme) engine.setTheme(theme);

  export function fitView(padding?: number) { engine?.fitView(padding); }
  export function centerNode(id: string) { engine?.centerNode(id); }

  $: mountItems = Array.from(portalMounts.entries()).map(([nodeId, domElement]) => {
      const nodeData = nodes.find(n => n.id === nodeId);
      return {
          nodeId,
          domElement,
          nodeData,
          component: nodeData ? nodeTypes[nodeData.type] : null
      };
  }).filter(m => m.nodeData);
</script>

<div 
  bind:this={container} 
  class="sci-flow-svelte-container"
  style="width: 100%; height: 100%; min-height: 400px; position: relative;"
>
  {#each mountItems as mount (mount.nodeId)}
  <div use:portal={mount.domElement}>
       {#if mount.component}
         <svelte:component this={mount.component} node={mount.nodeData} />
       {:else}
         <div class="sf-svelte-fallback">
            <strong>{mount.nodeData.type}</strong>
            <small>{mount.nodeId}</small>
         </div>
       {/if}
  </div>
  {/each}
  <slot />
</div>

<script context="module">
  function portal(node, target) {
    if (!target) return;
    target.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      }
    };
  }
</script>

<style>
  .sci-flow-svelte-container { overflow: hidden; }
  .sf-svelte-fallback {
    background: #333;
    color: white;
    padding: 10px;
    border-radius: 6px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
