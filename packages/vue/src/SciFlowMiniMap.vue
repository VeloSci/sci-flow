<template>
  <div 
    ref="containerRef" 
    class="sci-flow-minimap"
    :style="{ position: 'absolute', zIndex: 100 }"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Minimap, SciFlow } from '@sci-flow/core';

const props = withDefaults(defineProps<{
  engine: SciFlow | null;
  width?: number;
  height?: number;
  nodeColor?: string;
  viewportColor?: string;
  backgroundColor?: string;
}>(), {
  width: 150,
  height: 100
});

const containerRef = ref<HTMLDivElement | null>(null);
let minimapInstance: Minimap | null = null;

const initMinimap = () => {
  if (minimapInstance) {
    minimapInstance.destroy();
    minimapInstance = null;
  }
  
  if (containerRef.value && props.engine) {
    const stateManager = (props.engine as any).stateManager;
    minimapInstance = new Minimap({
      container: containerRef.value,
      stateManager,
      width: props.width,
      height: props.height,
      nodeColor: props.nodeColor,
      viewportColor: props.viewportColor,
      backgroundColor: props.backgroundColor
    });
  }
};

watch(() => props.engine, initMinimap);
watch([() => props.width, () => props.height, () => props.nodeColor, () => props.viewportColor, () => props.backgroundColor], initMinimap);

onMounted(initMinimap);

onUnmounted(() => {
  if (minimapInstance) minimapInstance.destroy();
});
</script>
