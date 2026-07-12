import path from 'node:path'

import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'
import glsl from 'vite-plugin-glsl'

import {tweeqStylusOptions} from '../../scripts/vite-stylus'

const here = new URL('.', import.meta.url).pathname

// Documentation playground for the React renderer. Serve with `pnpm dev`;
// Playwright e2e boots this via the root `pnpm e2e`.
export default defineConfig({
	plugins: [glsl(), react()],
	css: {
		preprocessorOptions: {
			scss: {api: 'modern-compiler'},
			styl: tweeqStylusOptions,
		},
	},
	resolve: {
		alias: {
			// Compile the workspace packages from source so the playground gets
			// HMR and always tracks the working tree. Packed-artifact coverage
			// lives in examples/react-vite instead.
			'@tweeq/react': path.resolve(here, '../../packages/react/src'),
			'@tweeq/core': path.resolve(here, '../../packages/core/src'),
			'@tweeq/dom': path.resolve(here, '../../packages/dom/src'),
			// In a real VuePress build this specifier is a generated temp file
			// forwarding the user's .vuepress/styles/palette.scss — this repo
			// has none, so the file is empty. Shim it for the theme's
			// _variables.scss (see styles/index.scss).
			'@vuepress/plugin-palette/palette': path.resolve(
				here,
				'styles/_empty-palette.scss'
			),
		},
	},
})
