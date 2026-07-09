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
      // Raise these as coverage improves (actual on 2026-07-08: 75.07/67.09/70.56/76.33).
      thresholds: {
        statements: 74,
        branches: 66,
        functions: 69,
        lines: 75,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
