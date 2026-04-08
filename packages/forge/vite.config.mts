/// <reference types='vitest' />
import {nxViteTsPaths} from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import {defineConfig} from 'vite';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/forge',
  plugins: [nxViteTsPaths()],
  test: {
    name: 'forge',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/forge',
      provider: 'v8' as const,
    },
  },
}));
