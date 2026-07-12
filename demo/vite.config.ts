import path from 'node:path'

import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'
import glsl from 'vite-plugin-glsl'

// Demo playground for the React port (see docs/react-port/PLAN.md).
// Serve with `npm run dev:demo`; Playwright e2e boots this via `npm run e2e`.
export default defineConfig({
	plugins: [glsl(), react()],
	resolve: {
		alias: {
			// In a real VuePress build this specifier is a generated temp file
			// forwarding the user's .vuepress/styles/palette.scss — this repo
			// has none, so the file is empty. Shim it for the theme's
			// _variables.scss (see demo/styles/index.scss).
			'@vuepress/plugin-palette/palette': path.resolve(
				new URL('.', import.meta.url).pathname,
				'styles/_empty-palette.scss'
			),
		},
	},
})
