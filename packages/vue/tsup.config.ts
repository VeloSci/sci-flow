import { defineConfig } from 'tsup';
import vuePlugin from 'unplugin-vue/esbuild';

export default defineConfig({
  entry: ['src/index.ts', 'src/SciFlow.vue'],
  format: ['cjs', 'esm'],
  dts: false, // We will use vue-tsc for declarations
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['vue', '@sci-flow/core'],
  esbuildPlugins: [
      vuePlugin()
  ]
});
