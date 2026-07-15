import vue from '@vitejs/plugin-vue'
import {resolve} from 'path'
import dts from 'vite-plugin-dts'
import glsl from 'vite-plugin-glsl'
import {defineConfig} from 'vitest/config'

// Keep the upstream browser UMD artifact while also exposing code-split ES/CJS
// package entries. The CJS entry is required for a truthful `require` export.
export default defineConfig({
	// Library-emitted workers must stay relative to the package entry so a
	// consuming Vite app can rewrite/copy them under its own deployment base.
	base: './',
	plugins: [glsl(), vue(), dts({tsconfigPath: './tsconfig.build.json'})],
	publicDir: false,
	build: {
		sourcemap: true,
		lib: {
			name: 'Tweeq',
			entry: resolve(__dirname, 'src/index.ts'),
			formats: ['es', 'cjs', 'umd'],
			fileName: format =>
				format === 'es'
					? 'index.es.js'
					: format === 'cjs'
						? 'index.cjs'
						: 'index.umd.js',
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
	define: {
		// This is needed to make the PromiseQueue class available in the browser.
		'process.env.PROMISE_QUEUE_COVERAGE': false,
	},
})
