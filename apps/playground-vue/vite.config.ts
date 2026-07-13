import path from 'node:path'

import vue from '@vitejs/plugin-vue'
import {defineConfig} from 'vite'
import glsl from 'vite-plugin-glsl'

import {tweeqStylusOptions} from '../../scripts/vite-stylus'

const here = new URL('.', import.meta.url).pathname

// Vue behavior playground. Compiles @tweeq/vue from source so it always
// tracks the working tree (packed-artifact coverage lives in
// examples/vue-vite instead).
export default defineConfig({
	plugins: [glsl(), vue()],
	css: {preprocessorOptions: {styl: tweeqStylusOptions}},
	resolve: {
		alias: [
			{
				find: '@tweeq/vue/style.css',
				replacement: path.resolve(here, '../../packages/styles/src/style.styl'),
			},
			{
				find: '@tweeq/vue',
				replacement: path.resolve(here, '../../packages/vue/src'),
			},
			{
				find: '@tweeq/core',
				replacement: path.resolve(here, '../../packages/core/src'),
			},
			{
				find: '@tweeq/dom',
				replacement: path.resolve(here, '../../packages/dom/src'),
			},
		],
	},
})
