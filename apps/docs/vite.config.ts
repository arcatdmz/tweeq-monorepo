import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'
import glsl from 'vite-plugin-glsl'

// Documentation playground for the React renderer. Serve with `pnpm dev`;
// Playwright e2e boots this via the root `pnpm e2e`.
export default defineConfig({
	plugins: [glsl(), react()],
	css: {
		preprocessorOptions: {
			scss: {api: 'modern-compiler'},
		},
	},
	resolve: {
		alias: [
			// In a real VuePress build this specifier is a generated temp file
			// forwarding the user's .vuepress/styles/palette.scss — this repo
			// has none, so the file is empty. Shim it for the theme's
			// _variables.scss (see styles/index.scss).
			{
				find: '@vuepress/plugin-palette/palette',
				replacement: new URL('styles/_empty-palette.scss', import.meta.url).pathname,
			},
		],
	},
})
