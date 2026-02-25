<script setup>
import { onMounted, ref, onBeforeUnmount, watch } from 'vue'
import { useData } from 'vitepress'

const container = ref(null)
const { isDark } = useData()
let root = null

async function mountExample() {
  if (!container.value) return

  // Load React and components dynamically
  const React = await import('react')
  const { createRoot } = await import('react-dom/client')
  const { FullExampleApp } = await import('./FullExampleApp')

  if (root) {
    root.unmount()
  }

  root = createRoot(container.value)
  
  root.render(
    React.createElement(FullExampleApp, {
      theme: isDark.value ? 'dark' : 'light'
    })
  )
}

onMounted(() => {
  mountExample()
})

watch(isDark, () => {
  mountExample()
})

onBeforeUnmount(() => {
  if (root) {
    root.unmount()
    root = null
  }
})
</script>

<template>
  <div class="example-app-root">
    <div ref="container" style="min-height: 800px; width: 100%;"></div>
  </div>
</template>

<style scoped>
.example-app-root {
  margin: 1rem 0;
}
</style>
