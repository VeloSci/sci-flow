<script setup>
import { ref } from 'vue';
import { SciFlow, Background, BackgroundVariant } from '@sci-flow/vue';
import '@sci-flow/core/styles.css';

const nodes = ref([{ id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } }]);
const edges = ref([{ id: 'e1', source: '1', target: '2' }]);
</script>

<template>
  <div style="width: 100vw; height: 100vh;">
    <SciFlow :nodes="nodes" :edges="edges" fit-view>
      <Background :variant="BackgroundVariant.Dots" :gap="12" :size="1" />
    </SciFlow>
  </div>
</template>
