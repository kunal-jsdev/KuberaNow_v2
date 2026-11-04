import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tailwindcss from 'eslint-plugin-tailwindcss';

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'dist/**', 'next-env.d.ts']),
  {
    plugins: {
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
      tailwindcss,
      'better-tailwindcss': betterTailwindcss,
    },
    rules: {
      // React Refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // React specific overrides
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react/no-unstable-nested-components': 'off',

      // General rules
      'no-var': 'error',
      'prefer-const': 'error',
      'no-shadow': 'warn',
      'one-var-declaration-per-line': 'error',
      'operator-assignment': 'error',
      'no-const-assign': 'error',
      'no-multi-assign': 'error',
      'no-plusplus': 'warn',
      'id-length': 0,
      camelcase: 'warn',
      'new-cap': 'warn',
      'no-restricted-globals': 'error',
      'no-use-before-define': [
        'warn',
        {
          functions: false,
          allowNamedExports: true,
        },
      ],

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'none',
          varsIgnorePattern: '^_',
        },
      ],

      // Classes
      'no-useless-constructor': 'error',
      'no-dupe-class-members': 'error',

      // Functions
      'no-prototype-builtins': 'warn',
      'prefer-arrow-callback': 'error',
      'no-loop-func': 'error',
      'no-console': 'warn',
      'no-eval': 'error',
      'prefer-rest-params': 'warn',
      'no-new-func': 'error',
      'no-param-reassign': 'warn',
      'no-confusing-arrow': 'error',

      // Objects
      'prefer-destructuring': 'warn',
      'no-new-object': 'error',
      'object-shorthand': 'warn',
      'prefer-spread': 'error',
      'dot-notation': 'error',
      'no-new-wrappers': 'error',

      // Arrays
      'no-array-constructor': 'error',
      'array-callback-return': 'error',
      'no-iterator': 'error',
      'no-restricted-syntax': 'error',

      // Blocks
      'no-fallthrough': 'warn',
      'no-case-declarations': 'error',
      'no-else-return': 'error',

      // Comparison
      eqeqeq: 'error',
      'no-unneeded-ternary': 'error',
      'no-nested-ternary': 'error',
      'no-mixed-operators': 'warn',

      // Strings
      'prefer-template': 'error',
      'no-useless-escape': 'error',
      'template-curly-spacing': 'error',

      // Import rules
      'import/no-duplicates': 'error',
      'import/no-mutable-exports': 'error',
      'import/prefer-default-export': 'off',
      'import/first': 'error',
      'import/no-webpack-loader-syntax': 'error',
      'import/no-unresolved': [
        'error',
        {
          ignore: [
            '.css$',
            '.scss$',
            '.sass$',
            '.less$',
            '.png$',
            '.jpg$',
            '.jpeg$',
            '.gif$',
            '.svg$',
            '.ico$',
          ],
        },
      ],
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
          mjs: 'never',
        },
      ],
      'import/no-absolute-path': 'off',

      // Simple import sort
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react', '^react-dom'],
            ['^@?\\w'],
            ['^@/'],
            ['^\\.\\./'],
            ['^\\./'],
            ['^.+\\.(css|scss|sass|less|module\\.css|module\\.scss)$'],
          ],
        },
      ],

      // Restricted imports
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['default'],
              message: "Please don't explicitly import React.",
            },
          ],
        },
      ],

      // React specific rules
      'react/forbid-prop-types': [
        'warn',
        {
          forbid: ['object'],
          checkContextTypes: true,
          checkChildContextTypes: true,
        },
      ],
      'react/display-name': 'warn',
      'react/prefer-es6-class': 'error',
      'react/jsx-boolean-value': 'error',
      'react/prefer-stateless-function': 'warn',
      'react/no-array-index-key': 'error',
      'react/no-string-refs': 'error',
      'react/jsx-no-bind': [
        'error',
        { allowArrowFunctions: true, allowFunctions: true },
      ],
      'react/require-render-return': 'error',
      'react/no-is-mounted': 'error',
      'react/sort-prop-types': [
        'error',
        {
          noSortAlphabetically: false,
          requiredFirst: true,
          sortShapeProp: true,
        },
      ],
      'react/jsx-filename-extension': [
        'error',
        { extensions: ['.tsx', '.jsx', '.js', '.ts'] },
      ],
      'react/jsx-uses-vars': 'error',
      'react/jsx-closing-bracket-location': 'error',
      'react/jsx-indent': ['error', 2],
      'react/jsx-indent-props': ['error', 2],
      'react/jsx-key': 'warn',
      'react/jsx-first-prop-new-line': ['error', 'multiline'],
      'react/jsx-max-props-per-line': [
        'error',
        {
          maximum: {
            single: 2,
            multi: 1,
          },
        },
      ],
      'react/jsx-wrap-multilines': [
        'error',
        {
          declaration: 'parens-new-line',
          assignment: 'parens-new-line',
          return: 'parens-new-line',
          arrow: 'parens-new-line',
          condition: 'ignore',
          logical: 'ignore',
          prop: 'ignore',
        },
      ],
      'react/button-has-type': 'off',

      // TypeScript specific
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-ts-ignore': 'off',

      // Other rules
      'arrow-body-style': 'off',
      'no-plusplus': 'off',
      'spaced-comment': 'off',
      'consistent-return': 'off',
      'prefer-destructuring': 'off',
      'react/function-component-definition': 'off',
      'react/jsx-props-no-spreading': 'off',
      'no-param-reassign': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'no-useless-escape': 'off',
      'object-shorthand': 'off',
      'no-else-return': 'off',
      'no-restricted-syntax': 'off',
      'no-console': 'error',
      'comma-dangle': ['error', 'only-multiline'],
      'max-len': 'off',
      'no-trailing-spaces': 'warn',
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['warn', 'always'],
      'template-curly-spacing': 'off',
      'no-duplicate-imports': 'error',
      'wrap-iife': ['error', 'any'],
      'no-multi-spaces': 'off',
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/enforces-shorthand': 'warn',
      'better-tailwindcss/no-unnecessary-whitespace': 'warn',
    },
    settings: {
      tailwindcss: {
        config: {},
      },
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          moduleDirectory: ['node_modules', '../../node_modules'],
        },
      },
      'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
  },
  eslintConfigPrettier,
]);
