import path from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Test-only config, kept separate from `vite.config.ts` so the browser-oriented
 * plugins and aliases (legacy build, `path-browserify`) stay out of the Node
 * test environment. `globals: true` keeps the existing Jest-style specs working
 * without an import of their own.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@public': path.resolve(__dirname, 'public'),
    },
  },
  test: {
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
