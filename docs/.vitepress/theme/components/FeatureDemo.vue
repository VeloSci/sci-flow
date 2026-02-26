<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{ component: string }>()
const container = ref(null)
const { isDark } = useData()
let root: any = null

async function mountDemo() {
  if (!container.value) return
  const React = await import('react')
  // @ts-ignore
  const { createRoot } = await import('react-dom/client')
  const mod: any = await import(`./demos/${props.component}.tsx`)
  const Component = mod[props.component]
  if (!Component) return
  if (root) root.unmount()
  root = createRoot(container.value)
  root.render(React.createElement(Component, { theme: isDark.value ? 'dark' : 'light' }))
}

onMounted(() => mountDemo())
watch(isDark, () => mountDemo())
onBeforeUnmount(() => { if (root) { root.unmount(); root = null } })
</script>

<template>
  <div class="feature-demo-root">
    <div ref="container" style="min-height: 440px; width: 100%;"></div>
  </div>
</template>

<style scoped>
.feature-demo-root { margin: 1rem 0; }
</style>
