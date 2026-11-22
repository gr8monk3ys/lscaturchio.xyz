/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      comment: 'No dependency cycles. Extract the shared piece into its own module.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'shared-code-does-not-import-routes',
      comment:
        'src/lib, src/components, src/hooks and src/constants are shared by routes. They must not import from src/app; move what they need into src/lib or src/components.',
      severity: 'error',
      from: { path: '^src/(lib|components|hooks|constants|data|types)/' },
      to: { path: '^src/app/', pathNot: '^src/app/.*\\.(css|mdx)$' },
    },
    {
      name: 'tests-are-private',
      comment: 'Test helpers under src/__tests__ are for tests only; production code must not import them.',
      severity: 'error',
      from: { pathNot: '^src/__tests__/' },
      to: { path: '^src/__tests__/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    includeOnly: '^(src|scripts|e2e|evals)/',
    exclude: { path: '^src/generated/|\\.d\\.ts$' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
  },
};
