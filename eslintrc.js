module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        "eslint:recommended",
    ],
    parserOptions: {
        "ecmaVersion": "2020",
        "sourceType": "module"
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'import/extensions': 'off',
        'import/no-unresolved': 'off',
        'quotes': ['warn', 'double'],
        semi: ['error', 'never'],
        'max-len': 'off',
        'linebreak-style': 'off',
        camelcase: ['off', { properties: 'never', ignoreDestructuring: true, ignoreImports: true }],
        'arrow-parens': ['error', 'as-needed'],
        'vue/multiline-html-element-content-newline': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'import/prefer-default-export': 'off',
        'default-case': 'off',
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
            files: ['*.ts', '*.tsx'],
            rules: {
                '@typescript-eslint/explicit-module-boundary-types': ['error'],
            },
        },
    ],
    ignorePatterns: ['node_modules/*'],
}
