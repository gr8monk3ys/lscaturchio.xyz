import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.tsx'],
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/setup.tsx',
        '**/*.d.ts',
        '**/*.config.*',
        '.next/',
      ],
      // Ratchet: set just below actual coverage so CI fails on regressions.
      // Raise these as coverage improves (actual on 2026-07-06: 69.96/60.88/62.6/71.4).
      thresholds: {
        statements: 69,
        branches: 60,
        functions: 62,
        lines: 71,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
