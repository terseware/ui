// @ts-check
import nx from '@nx/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier/recommended';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    'ignores': ['**/dist', '**/out-tsc', '**/vitest.config.*.timestamp*', 'apps/docs'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@terse-ui/core/testing', '@terse-ui/core/testing/*'],
              message: 'Testing utilities are only available in .spec.ts files.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['./packages/**/*.ts', './apps/**/*.ts', './tests/**/*.ts', './tools/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['**/tsconfig.*?.json'],
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {prefer: 'type-imports', fixStyle: 'inline-type-imports'},
      ],
    },
  },
  prettierConfig,
  prettier,
  {
    ignores: ['**/vitest.config.*.timestamp*'],
  },
];
