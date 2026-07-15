import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'
import glsl from 'vite-plugin-glsl'

// Exhaustive React behavior playground. The workspace package is resolved
// through its public dist exports, just like a real consumer.
export default defineConfig({
	plugins: [glsl(), react()],
})
