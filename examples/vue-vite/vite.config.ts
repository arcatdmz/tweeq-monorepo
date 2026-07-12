import vue from '@vitejs/plugin-vue'
import {defineConfig} from 'vite'

// Deliberately minimal: no glsl/stylus plugins and no source aliases. This
// app must build from the packaged @tweeq/vue artifact alone, so it doubles
// as the packed-tarball smoke test (plan §7, CI gate 9).
export default defineConfig({
	plugins: [vue()],
})
