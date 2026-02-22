<script setup lang="ts">
import { computed } from 'vue';
import { useSciFlow, UseSciFlowProps } from './useSciFlow';

const props = defineProps<{
    initialNodes?: UseSciFlowProps['initialNodes'];
    initialEdges?: UseSciFlowProps['initialEdges'];
    renderer?: UseSciFlowProps['renderer'];
    onNodeContextMenu?: UseSciFlowProps['onNodeContextMenu'];
    onEdgeContextMenu?: UseSciFlowProps['onEdgeContextMenu'];
    onPaneContextMenu?: UseSciFlowProps['onPaneContextMenu'];
    minZoom?: UseSciFlowProps['minZoom'];
    maxZoom?: UseSciFlowProps['maxZoom'];
    
    // An object containing Vue components representing node types
    nodeTypes?: Record<string, any>; 
}>();

const { containerRef, portalMounts, nodes } = useSciFlow(props);

// Convert Map to Array for predictable Vue v-for rendering with Teleport
const mountsArray = computed(() => {
    return Array.from(portalMounts.value.entries()).map(([nodeId, domElement]) => {
        const nodeData = nodes.value.find(n => n.id === nodeId);
        return {
            nodeId,
            domElement,
            nodeData,
            // Find specific Vue component or fallback
            component: nodeData ? (props.nodeTypes?.[nodeData.type] || null) : null
        };
    }).filter(m => m.nodeData); // ensure nodeData exists
});

defineExpose({
    containerRef,
    nodes,
    portalMounts
});
</script>

<template>
  <div 
    ref="containerRef" 
    class="sci-flow-vue-container" 
    style="width: 100%; height: 100%; position: relative; overflow: hidden;"
  >
    <!-- Vanilla engine injects SVGRenderer/CanvasRenderer here dynamically -->

    <!-- Teleport Vue Components into Vanilla DOM nodes -->
    <template v-for="mount in mountsArray" :key="mount.nodeId">
       <Teleport :to="mount.domElement" v-if="mount.domElement">
          <!-- User provided Custom Vue Node String match -->
          <component 
             v-if="mount.component" 
             :is="mount.component" 
             :node="mount.nodeData" 
          />
          <!-- Fallback Vanilla representation if generic -->
          <div v-else style="background: #333; color: white; padding: 10px; border-radius: 6px; width: 100%; height: 100%;">
             <strong>{{ mount.nodeData?.type }}</strong><br/>
             <small>{{ mount.nodeId }}</small>
          </div>
       </Teleport>
    </template>

    <!-- Optional Overlays/Minimap -->
    <slot></slot>
  </div>
</template>
