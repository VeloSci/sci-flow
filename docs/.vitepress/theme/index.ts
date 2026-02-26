import DefaultTheme from 'vitepress/theme'
import InteractiveFlow from './components/InteractiveFlow.vue'
import SciFlowPlayground from './components/SciFlowPlayground.vue'
import FullExampleApp from './components/FullExampleApp.vue'
import FrameworkDemo from './components/FrameworkDemo.vue'
import FeatureDemo from './components/FeatureDemo.vue'
import './custom.css'
import { App } from 'vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: App }) {
    app.component('InteractiveFlow', InteractiveFlow)
    app.component('SciFlowPlayground', SciFlowPlayground)
    app.component('FullExampleApp', FullExampleApp)
    app.component('FrameworkDemo', FrameworkDemo)
    app.component('FeatureDemo', FeatureDemo)
  }
}
