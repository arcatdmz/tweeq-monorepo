import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

// Deliberately minimal: no glsl/stylus plugins and no source aliases. This
// app must build from the packaged @tweeq/react artifact alone, so it doubles
// as the packed-tarball smoke test.
export default defineConfig({
	plugins: [react()],
})
