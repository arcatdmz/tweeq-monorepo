import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'
import glsl from 'vite-plugin-glsl'

// Demo playground for the React port (see docs/react-port/PLAN.md).
// Serve with `npm run dev:demo`; Playwright e2e boots this via `npm run e2e`.
export default defineConfig({
	plugins: [glsl(), react()],
})
