import DefaultTheme from 'vitepress/theme'
import InteractiveFlow from './components/InteractiveFlow.vue'
import SciFlowPlayground from './components/SciFlowPlayground.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: any }) {
    app.component('InteractiveFlow', InteractiveFlow)
    app.component('SciFlowPlayground', SciFlowPlayground)
  }
}
