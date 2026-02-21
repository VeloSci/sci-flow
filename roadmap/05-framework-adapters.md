# Roadmap Phase 5: Framework Adapters (React & Vue)

## 1. Objective
Wrap the extreme-performance agnostic core into idiomatic, developer-friendly adapters for React and Vue, ensuring seamless integration into modern front-end ecosystems.

## 2. Key Features

### React Adapter
- Develop native React hooks (`useNodes`, `useEdges`, `useSciFlow`) that bind to the vanilla store without introducing React rendering overhead.
- Allow users to write custom Node structures and designs using standard React components (JSX/TSX).
- Ensure the reconciliation process doesn't bottleneck the underlying Canvas/SVG virtualization.

### Vue 3 Adapter
- Provide idiomatic Vue composables (`useNodes`, `useSciFlow`) leveraging the Vue reactivity proxy safely.
- Support Vue Single File Components (`.vue`) for bespoke Node UI design natively.
- Provide a clean Vue-specific wrapper component `<SciFlow />`.

### Headless By Design
- The adapters should strictly serve as a bridge between the framework's reactivity loop and the library's internal agnostic store.
- Both React and Vue adapters must expose an identical API surface. Transitioning flow definitions and logic across frameworks should require zero changes to the fundamental graph logic itself.

## 3. Milestones
- [ ] Build the `@sci-flow/react` package with dedicated hooks and context providers.
- [ ] Ensure React nodes render cleanly via Portals natively within the SVG/Canvas structure.
- [ ] Build the `@sci-flow/vue` package and components.
- [ ] Conduct API parity tests between React, Vue, and Vanilla environments to guarantee an identical developer experience.
