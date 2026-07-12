import react from '@vitejs/plugin-react'
import {resolve} from 'path'
import dts from 'vite-plugin-dts'
import glsl from 'vite-plugin-glsl'
import {defineConfig} from 'vitest/config'

export default defineConfig({
	plugins: [
		glsl(),
		react(),
		dts({
			tsconfigPath: './tsconfig.build.json',
			rollupTypes: true,
		}),
	],
	publicDir: false,
	build: {
		lib: {
			name: 'Tweeq',
			entry: resolve(__dirname, 'src/index.ts'),
			formats: ['es', 'cjs'],
			fileName: format => (format === 'es' ? 'index.es.js' : 'index.cjs'),
		},
		outDir: 'dist',
		rollupOptions: {
			external: ['react', 'react-dom', 'react/jsx-runtime'],
		},
	},
	define: {
		// This is needed to make the PromiseQueue class available in the browser.
		'process.env.PROMISE_QUEUE_COVERAGE': false,
	},
})
