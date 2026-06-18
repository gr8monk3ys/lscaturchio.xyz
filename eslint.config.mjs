import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
    'playwright-report/**',
    'test-results/**',
    'tmp/**',
    'public/audio/.tmp/**',
    // Vendored Python virtualenv for the local TTS scripts (gitignored).
    // ESLint flat config does not read .gitignore, so without this it walks
    // into scripts/.tts-venv and lints thousands of site-packages JS files.
    'scripts/.tts-venv/**',
    '**/*venv*/**',
    '**/__pycache__/**',
  ]),
  {
    files: ['scripts/**/*.{js,cjs}'],
    rules: {
      // Node scripts in this repo are allowed to use CommonJS requires.
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    rules: {
      // Downgrade to warnings while we fix the codebase
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'prefer-const': 'warn',
    },
  },
]);

export default eslintConfig;
