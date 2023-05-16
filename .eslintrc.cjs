// @ts-check

/** @satisfies {import('eslint').Linter.Config} */
const config = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    eqeqeq: 'error',
    'no-constant-binary-expression': 'error',
    'import/no-cycle': 'warn',
  },
  overrides: [
    {
      files: ['.eslintrc.*', '.prettierrc.*', '*.config.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-undef': 'off',
      },
    },
  ],
  ignorePatterns: ['dist'],
}

module.exports = config
