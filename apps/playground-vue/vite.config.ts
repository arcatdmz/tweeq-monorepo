import path from 'node:path'

import vue from '@vitejs/plugin-vue'
import {defineConfig} from 'vite'
import glsl from 'vite-plugin-glsl'

const here = new URL('.', import.meta.url).pathname

// Vue behavior playground. Compiles @tweeq/vue from source so it always
// tracks the working tree (packed-artifact coverage lives in
// examples/vue-vite instead).
export default defineConfig({
	plugins: [glsl(), vue()],
	resolve: {
		alias: {
			'@tweeq/vue': path.resolve(here, '../../packages/vue/src'),
		},
	},
})
