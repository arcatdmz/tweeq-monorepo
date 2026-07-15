import vue from '@vitejs/plugin-vue'
import {defineConfig} from 'vite'
import glsl from 'vite-plugin-glsl'

// Vue behavior playground. The workspace package is resolved through its
// public dist exports, just like a real consumer.
export default defineConfig({
	plugins: [glsl(), vue()],
})
