import { defineConfig } from 'vitepress'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  title: 'sci-flow',
  description: 'High-performance scientific flow engine',
  base: '/sci-flow/',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/overview' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/basic' },
      { text: 'Playground', link: '/playground' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Overview', link: '/guide/overview' },
            { text: 'Getting Started', link: '/guide/getting-started' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'The Engine', link: '/guide/core-engine' },
            { text: 'State Management', link: '/guide/state' },
            { text: 'Rendering', link: '/guide/rendering' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Core API', link: '/api/core' },
            { text: 'React API', link: '/api/react' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Basic Examples',
          items: [
            { text: 'Basic Flow', link: '/examples/basic' },
            { text: 'Custom Nodes', link: '/examples/custom-nodes' }
          ]
        },
        {
          text: 'Advanced Examples',
          items: [
            { text: 'Animated Edges', link: '/examples/animated-edges' },
            { text: 'Multi-Node Flow', link: '/examples/multi-node' },
            { text: 'Complex Ports', link: '/examples/complex-ports' },
            { text: 'Smart Routing', link: '/examples/smart-routing' },
            { text: 'Validation & Colors', link: '/examples/validation' }
          ]
        }
      ],
      '/playground': [
        {
          text: 'Interactive Playground',
          items: [
            { text: 'Full Demo', link: '/playground' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/jigonzalez930209/sci-flow' }
    ]
  },
  vite: {
    plugins: [react() as any],
    resolve: {
      alias: [
        { find: '@sci-flow/core', replacement: resolve(__dirname, '../../packages/core/src/index.ts') },
        { find: '@sci-flow/react', replacement: resolve(__dirname, '../../packages/react/src/index.ts') }
      ]
    }
  }
})
