import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'prefer-const': 'warn',
      'no-unused-vars': 'off',
      'no-debugger': 'warn',
      'no-undef': 'warn',
      'no-unreachable': 'warn',
      'no-unused-expressions': 'warn',
      'no-unused-labels': 'warn',
      'no-useless-catch': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
)
