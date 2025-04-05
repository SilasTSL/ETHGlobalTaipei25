import globals from 'globals'
import pluginJs from '@eslint/js'
// eslint.config.js
const prettierPlugin = await import('eslint-plugin-prettier')

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['node_modules', 'dist'], // Ignore build files
  },
  {
    files: ['**/*.js', '**/*.ts'], // Apply to JS and TS files
    languageOptions: {
      sourceType: 'module', // Use ES modules
    },
    plugins: {
      prettier: prettierPlugin.default,
    },
    rules: {
      'prettier/prettier': ['error', { semi: false }], // Show Prettier issues as errors
      'no-unused-vars': 'warn', // Enforce Prettier formatting as errors
    },
    // 'editor.codeActionsOnSave': {
    //   'source.fixAll.eslint': false,
    // },
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
]
