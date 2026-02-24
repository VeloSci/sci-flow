import { defineConfig } from 'tsup';
import sveltePlugin from 'esbuild-svelte';
import sveltePreprocess from 'svelte-preprocess';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['svelte'],
  esbuildPlugins: [
    sveltePlugin({
      preprocess: sveltePreprocess(),
    }),
  ],
});
