module.exports = {
    env: {
        browser: false,
        commonjs: true,
        es2021: true,
        node: true,
        jest: true
    },
    extends: [
        'standard'
    ],
    parserOptions: {
        ecmaVersion: 'latest'
    },
    rules: {
        'no-console': 'warn',
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'comma-dangle': ['error', 'never'],
        'space-before-function-paren': ['error', 'always'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'never']
    }
}