import { defineConfig } from 'evalite/config';

// Evalite runs on Vitest and picks up vitest.config.ts, which is set up for the
// component tests: happy-dom and a setup file of React/Next mocks. The evals
// call server code, so they drop the setup file here and each one declares
// `@vitest-environment node` at its top.
export default defineConfig({
  setupFiles: [],
  // A model answer can take a while, especially from a local Ollama.
  testTimeout: 120_000,
  // Keeps a run inside provider rate limits and a laptop's Ollama.
  maxConcurrency: 3,
});
