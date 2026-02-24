<script setup>
import { onMounted, ref, onBeforeUnmount, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({
  initialNodes: {
    type: Array,
    default: () => []
  },
  initialEdges: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Framework Integration'
  }
})

const currentFramework = ref('react')
const currentDirection = ref('horizontal')
const container = ref(null)
const { isDark } = useData()

let currentInstance = null
let currentRoot = null
let currentEngine = null

// Tab options
const FRAMEWORKS = [
  { id: 'react', label: 'React 18+', icon: '⚛️' },
  { id: 'vue', label: 'Vue 3+', icon: '🖖' },
  { id: 'svelte', label: 'Svelte 5+', icon: '🔥' },
  { id: 'vanilla', label: 'Vanilla JS', icon: '🍦' }
]

async function mountFramework(framework) {
  if (!container.value) return

  // Cleanup previous instance
  if (currentInstance && typeof currentInstance.destroy === 'function') {
    currentInstance.destroy()
  }
  if (currentRoot) {
    currentRoot.unmount()
    currentRoot = null
  }
  container.value.innerHTML = ''
  currentInstance = null
  currentEngine = null

  const theme = isDark.value ? 'dark' : 'light'
  const direction = currentDirection.value

  // Set the container background directly (CSS var only works for Vanilla)
  updateContainerBackground()
  
  // Clone data to avoid mutations between framework switches
  const nodes = JSON.parse(JSON.stringify(props.initialNodes))
  const edges = JSON.parse(JSON.stringify(props.initialEdges))

  switch (framework) {
    case 'react': {
      const React = await import('react')
      const { createRoot } = await import('react-dom/client')
      const { SciFlow } = await import('@sci-flow/react')

      currentRoot = createRoot(container.value)
      currentRoot.render(
        React.createElement(SciFlow, {
          initialNodes: nodes,
          initialEdges: edges,
          theme,
          onInit: (engine) => {
            currentEngine = engine
            if (direction === 'vertical') engine.setDirection('vertical')
          }
        })
      )
      break
    }
    case 'vue': {
      const { createApp, h } = await import('vue')
      const { SciFlow } = await import('@sci-flow/vue')
      const app = createApp({
        render: () => h(SciFlow, {
          initialNodes: nodes,
          initialEdges: edges,
          theme,
          renderer: 'auto',
          onInit: (engine) => {
            currentEngine = engine
            if (direction === 'vertical') engine.setDirection('vertical')
          }
        })
      })
      currentInstance = { destroy: () => app.unmount() }
      app.mount(container.value)
      break
    }
    case 'svelte': {
      try {
        const { SciFlow } = await import('@sci-flow/svelte')
        const { mount, unmount } = await import('svelte')
        
        const instance = mount(SciFlow, {
          target: container.value,
          props: {
            initialNodes: nodes,
            initialEdges: edges,
            theme,
            onInit: (engine) => {
              currentEngine = engine
              if (direction === 'vertical') engine.setDirection('vertical')
            }
          }
        })
        currentInstance = { destroy: () => unmount(instance) }
      } catch (e) {
        console.error('Failed to mount Svelte component:', e)
        container.value.innerHTML = '<div style="padding: 20px; color: #ff6b6b;">Svelte demo currently unavailable in this environment.</div>'
      }
      break
    }
    case 'vanilla': {
      const { SciFlow } = await import('@sci-flow/core')
      currentEngine = new SciFlow({
        container: container.value,
        theme,
        renderer: 'auto'
      })
      currentEngine.setNodes(nodes)
      currentEngine.setEdges(edges)
      if (direction === 'vertical') currentEngine.setDirection('vertical')
      currentInstance = { destroy: () => currentEngine?.destroy() }
      break
    }
  }
}

function updateContainerBackground() {
  if (!container.value) return
  container.value.style.backgroundColor = isDark.value ? '#0f172a' : '#f8f9fa'
}

function toggleDirection() {
  const newDir = currentDirection.value === 'horizontal' ? 'vertical' : 'horizontal'
  currentDirection.value = newDir
  if (currentEngine && typeof currentEngine.setDirection === 'function') {
    currentEngine.setDirection(newDir)
  }
}

onMounted(() => {
  mountFramework(currentFramework.value)
})

watch(currentFramework, () => {
  mountFramework(currentFramework.value)
})

// Theme change: update engine theme in-place without remounting
watch(isDark, () => {
  updateContainerBackground()
  if (currentEngine && typeof currentEngine.setTheme === 'function') {
    currentEngine.setTheme(isDark.value ? 'dark' : 'light')
  }
})

onBeforeUnmount(() => {
  if (currentInstance && typeof currentInstance.destroy === 'function') {
    currentInstance.destroy()
  }
  if (currentRoot) {
    currentRoot.unmount()
  }
})

function handleDownload() {
  if (!currentEngine) return
  const json = currentEngine.toJSON()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sciflow-${currentFramework.value}-state.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="framework-demo-wrapper">
    <div class="framework-demo-header">
      <div class="demo-title">{{ title }}</div>
      <div class="demo-actions">
        <button class="export-btn" @click="toggleDirection" :title="currentDirection === 'horizontal' ? 'Switch to Vertical' : 'Switch to Horizontal'">
          <span v-if="currentDirection === 'horizontal'">⬇ Vertical</span>
          <span v-else>➡ Horizontal</span>
        </button>
        <button class="export-btn" @click="handleDownload">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12.5h8M7 1.5v8M7 9.5l-3-3M7 9.5l3-3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Save JSON
        </button>
      </div>
      <div class="framework-tabs">
        <button 
          v-for="fw in FRAMEWORKS" 
          :key="fw.id"
          class="tab-btn"
          :class="{ 'tab-btn--active': currentFramework === fw.id }"
          @click="currentFramework = fw.id"
        >
          <span class="tab-icon">{{ fw.icon }}</span>
          <span class="tab-label">{{ fw.label }}</span>
        </button>
      </div>
    </div>
    <div ref="container" class="framework-demo-container"></div>
  </div>
</template>

<style scoped>
.framework-demo-wrapper {
  margin: 2rem 0;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--sci-glass-border);
  background: var(--sci-surface-2);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.framework-demo-header {
  padding: 1rem;
  background: var(--sci-surface-3);
  border-bottom: 1px solid var(--sci-glass-border);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  overflow-x: auto;
}

.demo-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--sci-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.framework-tabs {
  display: flex;
  background: var(--sci-surface-1);
  padding: 4px;
  border-radius: 10px;
  gap: 4px;
  border: 1px solid var(--sci-glass-border);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 7px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--sci-text-secondary);
  transition: all 0.2s ease;
  border: none;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
}

.tab-btn:hover {
  color: var(--sci-text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn--active {
  background: var(--vp-c-brand) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.demo-actions {
  display: flex;
  gap: 6px;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--sci-text-primary);
  background: var(--sci-surface-1);
  border: 1px solid var(--sci-glass-border);
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.export-btn:hover {
  background: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
}

.framework-demo-container {
  height: 600px;
  width: 100%;
  position: relative;
  background: var(--sf-bg, #121417);
  transition: background-color 0.3s ease;
}
</style>
