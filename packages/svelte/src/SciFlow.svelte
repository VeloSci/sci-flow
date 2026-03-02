<script context="module" lang="ts">
  // Svelte action: moves a DOM node to a target container
  import type { Action } from "svelte/action";
  export const portal: Action<HTMLElement, HTMLElement | undefined> = (
    node,
    target,
  ) => {
    if (!target) return {};
    target.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      },
    };
  };
</script>

<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import {
    SciFlow,
    type SciFlowOptions,
    type Node,
    type Edge,
    type FlowState,
    type Theme,
  } from "@sci-flow/core";
  import type { ComponentType } from "svelte";

  export let initialNodes: Node[] = [];
  export let initialEdges: Edge[] = [];
  export let theme: SciFlowOptions["theme"] = "light";
  export let direction: SciFlowOptions["direction"] = "horizontal";
  export let renderer: SciFlowOptions["renderer"] = "auto";
  export let minZoom: number | undefined = undefined;
  export let maxZoom: number | undefined = undefined;
  export let nodeTypes: Record<string, ComponentType> = {};
  export let onInit: (engine: SciFlow) => void = () => {};

  const dispatch = createEventDispatcher<{
    init: SciFlow;
    change: FlowState;
  }>();
  let container: HTMLDivElement;
  let engine: SciFlow;
  let portalMounts = new Map<string, HTMLElement>();
  let highlightedConnection: FlowState["highlightedConnection"];

  onMount(() => {
    engine = new SciFlow({
      container,
      theme,
      direction,
      renderer,
      minZoom,
      maxZoom,
    });

    const stateManager = engine.stateManager;
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

    engine.setNodes(initialNodes);
    engine.setEdges(initialEdges);

    const unsubscribe = engine.subscribe((state: FlowState) => {
      highlightedConnection = state.highlightedConnection;
      dispatch("change", state);
    });

    onInit(engine);
    dispatch("init", engine);

    return () => {
      unsubscribe();
      engine.destroy();
    };
  });

  // Reactive updates — theme and direction propagate without remounting
  $: if (
    engine &&
    initialNodes &&
    engine.getState().nodes.size !== initialNodes.length
  )
    engine.setNodes(initialNodes);
  $: if (
    engine &&
    initialEdges &&
    engine.getState().edges.size !== initialEdges.length
  )
    engine.setEdges(initialEdges);
  $: if (engine && theme !== undefined)
    engine.setTheme(theme as Partial<Theme> | "light" | "dark" | "system");
  $: if (engine && direction !== undefined) engine.setDirection(direction);

  export function fitView(padding?: number): void {
    engine?.fitView(padding);
  }
  export function centerNode(id: string): void {
    engine?.centerNode(id);
  }

  interface MountItem {
    nodeId: string;
    domElement: HTMLElement | undefined;
    nodeData: Node | undefined;
    component: ComponentType | null;
  }

  $: mountItems = Array.from(portalMounts.keys())
    .map((nodeId): MountItem => {
      const nodeData = initialNodes.find((n: Node) => n.id === nodeId);
      return {
        nodeId,
        domElement: portalMounts.get(nodeId),
        nodeData,
        component: nodeData ? (nodeTypes[nodeData.type] ?? null) : null,
      };
    })
    .filter(
      (m): m is MountItem & { nodeData: Node; component: ComponentType } =>
        !!m.nodeData && !!m.component,
    );
</script>

<div
  bind:this={container}
  class="sci-flow-svelte-container"
  style="width: 100%; height: 100%; min-height: 400px; position: relative;"
>
  {#each mountItems as mount (mount.nodeId)}
    <div use:portal={mount.domElement}>
      <svelte:component
        this={mount.component}
        node={mount.nodeData}
        {engine}
        {highlightedConnection}
      />
    </div>
  {/each}
  <slot />
</div>

<style>
  .sci-flow-svelte-container {
    overflow: hidden;
  }
</style>
