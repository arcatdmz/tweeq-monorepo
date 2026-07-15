import eslint from '@eslint/js'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	{
		ignores: [
			'lib/**',
			'**/dist/**',
			'test-results/**',
			'src/**/*.vue',
			// node maintenance script, not app code
			'apps/docs/styles/extract-theme-styles.mjs',
		],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: globals.browser,
		},
		plugins: {
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports,
		},
		rules: {
			'arrow-body-style': 'off',
			'prefer-arrow-callback': 'off',
			'no-console': 'warn',
			'no-debugger': 'warn',
			'no-undef': 'off',
			eqeqeq: 'error',
			'prefer-const': 'error',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-use-before-define': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'simple-import-sort/imports': 'error',
			'unused-imports/no-unused-imports': 'error',
		},
	}
)
