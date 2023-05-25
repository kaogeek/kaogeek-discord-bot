// @ts-check

/** @satisfies {import('eslint').Linter.Config} */
const config = {
  root: true,
  env: {
    node: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin', 'import', 'unicorn'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:unicorn/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    eqeqeq: 'error',
    'no-constant-binary-expression': 'error',
    'import/no-cycle': 'warn',
    'import/no-duplicates': 'warn',
    'prettier/prettier': 'warn',
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          camelCase: true,
          pascalCase: true,
        },
      },
    ],
    'unicorn/no-null': 'off',
    'unicorn/prevent-abbreviations': [
      'error',
      {
        ignore: ['\\.e2e\\.'],
      },
    ],
  },
  ignorePatterns: ['dist'],
}

module.exports = config
