import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    target: 'es6',
    format: 'esm',
    css: {
      fileName: 'index.css',
    },
    sourcemap: true,
    publint: true,
    platform: 'browser',
    deps: {
      // Will error if we ever try to bundle dependencies (for example if we are importing a
      // dependency that is not in package.json)
      onlyBundle: [],
    },
    loader: {
      '.png': 'dataurl',
    },
  },
]);
