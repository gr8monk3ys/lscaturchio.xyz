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
        // Build and ops scripts are not app code. The ratchet below measures
        // src/; letting a 400-line probe script into the denominator drops
        // every metric several points and says nothing about the site.
        'scripts/',
        'src/__tests__/setup.tsx',
        '**/*.d.ts',
        '**/*.config.*',
        '.next/',
      ],
      // Ratchet: set just below actual coverage so CI fails on regressions.
      // Raise these as coverage improves; never lower them.
      thresholds: {
        statements: 86,
        branches: 76,
        functions: 83,
        lines: 88,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
