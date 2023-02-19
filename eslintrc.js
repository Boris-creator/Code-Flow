module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  rules: {
    'max-len': 'off',
    'linebreak-style': 'off',
    camelcase: ['off', { properties: 'never', ignoreDestructuring: true, ignoreImports: true }],
    'arrow-parens': ['error', 'as-needed'],
    /** Необходимые правила */
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    /** Для корректной работы работы typescript 4 */
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    /** Добавил, но надо будет принять решение */
    'no-empty-function': ['error', { allow: ['arrowFunctions'] }],
    '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],

    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-param-reassign': 'off',
    'no-prototype-builtins': 'off',
    'no-lone-blocks': 'off',
    'no-restricted-globals': 'off',
    "no-useless-constructor": "off",
    'class-methods-use-this': 'off',
  },
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': ['error'],
      },
    },
  ],
  ignorePatterns: ['node_modules/*'],
};
