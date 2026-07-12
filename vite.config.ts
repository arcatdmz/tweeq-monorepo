import vue from '@vitejs/plugin-vue'
import {resolve} from 'path'
import dts from 'vite-plugin-dts'
import glsl from 'vite-plugin-glsl'
import {configDefaults, defineConfig} from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
	return {
		plugins: [glsl(), vue(), dts({tsconfigPath: './tsconfig.build.json'})],
		publicDir: mode === 'development' ? undefined : false,
		build: {
			lib: {
				name: 'Tweeq',
				entry: resolve(__dirname, 'src/index.ts'),
				fileName: format => `index.${format}.js`,
			},
			outDir: 'lib',
			rollupOptions: {
				external: ['vue'],
				output: {
					globals: {
						vue: 'Vue',
					},
				},
			},
		},
		test: {
			// e2e/ holds Playwright specs (run via `npm run e2e`), not vitest ones.
			exclude: [...configDefaults.exclude, 'e2e/**'],
		},
		ssr: {
			noExternal: ['@baku89/pave'],
			external: ['paper', 'paper-jsdom-canvas'],
		},
		define: {
			// This is needed to make the PromiseQueue class available in the browser.
			'process.env.PROMISE_QUEUE_COVERAGE': false,
		},
	}
})
