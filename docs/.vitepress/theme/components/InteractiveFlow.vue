<script setup>
import { onMounted, ref, onBeforeUnmount, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({
  nodes: {
    type: Array,
    default: () => []
  },
  edges: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Interactive Flow'
  },
  height: {
    type: String,
    default: '400px'
  }
})

const container = ref(null)
const { isDark } = useData()
let root = null

async function mountFlow() {
  if (!container.value) return

  // Load React and sci-flow dynamically to avoid SSR issues
  const React = await import('react')
  const { createRoot } = await import('react-dom/client')
  const { SciFlow } = await import('@sci-flow/react')

  if (root) {
    root.unmount()
  }

  root = createRoot(container.value)
  
  root.render(
    React.createElement(SciFlow, {
      initialNodes: props.nodes,
      initialEdges: props.edges,
      theme: isDark.value ? 'dark' : 'light',
      style: { width: '100%', height: '100%' }
    })
  )
}

onMounted(() => {
  mountFlow()
})

watch(isDark, () => {
  mountFlow()
})

onBeforeUnmount(() => {
  if (root) {
    root.unmount()
    root = null
  }
})
</script>

<template>
  <div class="interactive-flow-wrapper">
    <div class="interactive-flow-header">
      <div class="header-dots">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
      </div>
      <div class="header-title">{{ title }}</div>
      <div class="header-badge">Live Demo</div>
    </div>
    <div ref="container" :style="{ height: height }" class="interactive-flow-content"></div>
  </div>
</template>

<style scoped>
.interactive-flow-wrapper {
  margin: 2rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.interactive-flow-header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 12px;
}

.header-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.red { background: #ff5f56; }
.yellow { background: #ffbd2e; }
.green { background: #27c93f; }

.header-title {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.header-badge {
  font-size: 10px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: bold;
}

.interactive-flow-content {
  position: relative;
  background: var(--vp-c-bg);
}
</style>
