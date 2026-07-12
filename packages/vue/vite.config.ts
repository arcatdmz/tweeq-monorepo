import vue from '@vitejs/plugin-vue'
import {resolve} from 'path'
import dts from 'vite-plugin-dts'
import glsl from 'vite-plugin-glsl'
import {defineConfig} from 'vitest/config'

// Mirrors the upstream baku89/tweeq build so Stage V1 stays a pure
// relocation: same entry shape, same externals, same SSR settings.
export default defineConfig({
	plugins: [glsl(), vue(), dts({tsconfigPath: './tsconfig.build.json'})],
	publicDir: false,
	build: {
		lib: {
			name: 'Tweeq',
			entry: resolve(__dirname, 'src/index.ts'),
			fileName: format => `index.${format}.js`,
		},
		outDir: 'dist',
		rollupOptions: {
			external: ['vue'],
			output: {
				globals: {
					vue: 'Vue',
				},
			},
		},
	},
	ssr: {
		noExternal: ['@baku89/pave'],
		external: ['paper', 'paper-jsdom-canvas'],
	},
	define: {
		// This is needed to make the PromiseQueue class available in the browser.
		'process.env.PROMISE_QUEUE_COVERAGE': false,
	},
})
