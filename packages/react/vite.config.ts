import react from '@vitejs/plugin-react'
import {resolve} from 'path'
import dts from 'vite-plugin-dts'
import glsl from 'vite-plugin-glsl'
import {defineConfig} from 'vitest/config'

export default defineConfig({
	// Library-emitted workers must stay relative to the package entry so a
	// consuming Vite app can rewrite/copy them under its own deployment base.
	base: './',
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
		sourcemap: true,
		lib: {
			name: 'Tweeq',
			entry: resolve(__dirname, 'src/index.ts'),
			formats: ['es', 'cjs'],
			fileName: format => (format === 'es' ? 'index.es.js' : 'index.cjs'),
		},
		outDir: 'dist',
		rollupOptions: {
			// Iconify's addIcon/loadIcon registry is part of its consumer-facing API.
			// Keep one application-owned instance so icons registered by the host are
			// visible inside Tweeq as well.
			external: [
				'@iconify/react',
				'react',
				'react-dom',
				'react/jsx-runtime',
			],
		},
	},
	define: {
		// This is needed to make the PromiseQueue class available in the browser.
		'process.env.PROMISE_QUEUE_COVERAGE': false,
	},
})
