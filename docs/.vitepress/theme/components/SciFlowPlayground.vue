<script setup>
import { onMounted, ref, onBeforeUnmount, watch } from 'vue'
import { useData } from 'vitepress'

const container = ref(null)
const { isDark } = useData()
let root = null

async function mountPlayground() {
  if (!container.value) return

  // Load React and components dynamically
  const React = await import('react')
  const { createRoot } = await import('react-dom/client')
  const { SciFlowPlayground } = await import('./SciFlowPlayground')

  if (root) {
    root.unmount()
  }

  root = createRoot(container.value)
  
  root.render(
    React.createElement(SciFlowPlayground, {
      theme: isDark.value ? 'dark' : 'light'
    })
  )
}

onMounted(() => {
  mountPlayground()
})

watch(isDark, () => {
  mountPlayground()
})

onBeforeUnmount(() => {
  if (root) {
    root.unmount()
    root = null
  }
})
</script>

<template>
  <div class="playground-root">
    <div ref="container" style="min-height: 600px; width: 100%;"></div>
  </div>
</template>

<style scoped>
.playground-root {
  margin: 2rem 0;
}
</style>
