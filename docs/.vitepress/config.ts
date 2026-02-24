import { defineConfig } from 'vitepress'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  title: 'sci-flow',
  description: 'High-performance scientific flow engine',
  base: '/sci-flow/',
  head: [
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/sci-flow/favicon.ico' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'sci-flow',
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
            { text: 'Themes & Layout', link: '/guide/themes-and-layout' },
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
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026-present sci-flow'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/jigonzalez930209/sci-flow' }
    ]
  },
  vite: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [react() as any, ...svelte() as any],
    resolve: {
      alias: [
        { find: /^@sci-flow\/core$/, replacement: resolve(__dirname, '../../packages/core/src/index.ts') },
        { find: /^@sci-flow\/react$/, replacement: resolve(__dirname, '../../packages/react/src/index.ts') },
        { find: /^@sci-flow\/vue$/, replacement: resolve(__dirname, '../../packages/vue/src/index.ts') },
        { find: /^@sci-flow\/svelte$/, replacement: resolve(__dirname, '../../packages/svelte/src/index.ts') }
      ]
    }
  }
})
