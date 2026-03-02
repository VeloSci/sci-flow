<script setup lang="ts">
import { computed } from 'vue';
import { useSciFlow } from './useSciFlow';
import type { UseSciFlowProps } from './useSciFlow';
import type { Node } from '@sci-flow/core';
import type { Component } from 'vue';

// Props typed correctly — nodeTypes is a Record for Vue (component-by-name)
const props = defineProps<{
    initialNodes?: UseSciFlowProps['initialNodes'];
    initialEdges?: UseSciFlowProps['initialEdges'];
    renderer?: UseSciFlowProps['renderer'];
    theme?: UseSciFlowProps['theme'];
    direction?: UseSciFlowProps['direction'];
    minZoom?: UseSciFlowProps['minZoom'];
    maxZoom?: UseSciFlowProps['maxZoom'];
    onNodeContextMenu?: UseSciFlowProps['onNodeContextMenu'];
    onEdgeContextMenu?: UseSciFlowProps['onEdgeContextMenu'];
    onPaneContextMenu?: UseSciFlowProps['onPaneContextMenu'];
    onInit?: (engine: InstanceType<typeof import('@sci-flow/core').SciFlow>) => void;
    // Vue components mapped by node type name
    nodeTypes?: Record<string, Component>;
}>();

const { containerRef, portalMounts, nodes, engine, highlightedConnection } = useSciFlow({
    initialNodes: props.initialNodes,
    initialEdges: props.initialEdges,
    renderer: props.renderer,
    theme: props.theme,
    direction: props.direction,
    minZoom: props.minZoom,
    maxZoom: props.maxZoom,
    onNodeContextMenu: props.onNodeContextMenu,
    onEdgeContextMenu: props.onEdgeContextMenu,
    onPaneContextMenu: props.onPaneContextMenu,
    onInit: props.onInit,
});

// Derive mount list — only include entries with a registered component
const mountsArray = computed(() => {
    return Array.from(portalMounts.value.entries())
        .map(([nodeId, domElement]) => {
            const nodeData: Node | undefined = nodes.value.find(n => n.id === nodeId);
            const component = nodeData ? (props.nodeTypes?.[nodeData.type] ?? null) : null;
            return { nodeId, domElement, nodeData, component };
        })
        .filter((m): m is { nodeId: string; domElement: HTMLElement; nodeData: Node; component: Component } =>
            !!m.nodeData && !!m.component
        );
});

defineExpose({ engine });
</script>

<template>
  <div
    ref="containerRef"
    class="sci-flow-vue-container"
    style="width: 100%; height: 100%; position: relative; overflow: hidden;"
  >
    <!-- Vanilla engine injects SVGRenderer/CanvasRenderer here dynamically -->

    <!-- Teleport Vue Components into Vanilla DOM nodes (only when custom node type exists) -->
    <template v-for="mount in mountsArray" :key="mount.nodeId">
      <Teleport :to="mount.domElement">
        <component :is="mount.component" :node="mount.nodeData" :engine="engine" :highlighted-connection="highlightedConnection" />
      </Teleport>
    </template>

    <!-- Optional Overlays/Minimap -->
    <slot></slot>
  </div>
</template>
