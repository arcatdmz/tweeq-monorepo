import {readFileSync, writeFileSync} from 'node:fs'
import {join, resolve} from 'node:path'

import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import rehypeSlug from 'rehype-slug'
import {defineConfig, type Plugin, type ResolvedConfig} from 'vite'
import glsl from 'vite-plugin-glsl'

import {reactMarkdownAdapter} from './markdownAdapter'
import {routeFiles} from './routes'

function staticDocumentationRoutes(): Plugin {
	let config: ResolvedConfig
	return {
		name: 'static-documentation-routes',
		configResolved(resolvedConfig) {
			config = resolvedConfig
		},
		configureServer(server) {
			server.middlewares.use((request, _response, next) => {
				const url = new URL(request.url ?? '/', 'http://localhost')
				if (routeFiles.some(file => url.pathname.endsWith(`/${file}`))) {
					request.url = `${server.config.base}index.html${url.search}`
				}
				next()
			})
		},
		writeBundle() {
			const outDir = resolve(config.root, config.build.outDir)
			const index = readFileSync(join(outDir, 'index.html'))
			for (const file of routeFiles) {
				writeFileSync(join(outDir, file), index)
			}
		},
	}
}

// Documentation playground for the React renderer. Serve with `pnpm dev`;
// Playwright e2e boots this via the root `pnpm e2e`.
export default defineConfig({
	plugins: [
		glsl(),
		reactMarkdownAdapter(),
		mdx({
			format: 'mdx',
			mdxExtensions: ['.md'],
			include: /\/docs\/.*\.md$/,
			rehypePlugins: [rehypeSlug],
		}),
		react(),
		staticDocumentationRoutes(),
	],
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
