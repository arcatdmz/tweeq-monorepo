import react from '@vitejs/plugin-react'
import {resolve} from 'path'
import dts from 'vite-plugin-dts'
import glsl from 'vite-plugin-glsl'
import {configDefaults, defineConfig} from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
	return {
		plugins: [
			glsl(),
			react(),
			dts({
				tsconfigPath: './tsconfig.build.json',
				include: ['src/core', 'src/react'],
				rollupTypes: true,
			}),
		],
		publicDir: mode === 'development' ? undefined : false,
		build: {
			lib: {
				name: 'Tweeq',
				entry: resolve(__dirname, 'src/react/index.ts'),
				formats: ['es', 'cjs'],
				fileName: format => (format === 'es' ? 'index.es.js' : 'index.cjs'),
			},
			outDir: 'lib',
			rollupOptions: {
				external: ['react', 'react-dom', 'react/jsx-runtime'],
			},
		},
		test: {
			// e2e/ holds Playwright specs (run via `npm run e2e`), not vitest ones.
			exclude: [...configDefaults.exclude, 'e2e/**'],
		},
		define: {
			// This is needed to make the PromiseQueue class available in the browser.
			'process.env.PROMISE_QUEUE_COVERAGE': false,
		},
	}
})
