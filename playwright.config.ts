import {defineConfig} from '@playwright/test'

/** Run via `pnpm e2e` after installing Chromium with Playwright's OS dependencies. */
export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	retries: 0,
	use: {
		baseURL: 'http://localhost:5174',
		// The docs theme scrolls smoothly, which races raw-coordinate mouse
		// interactions (boundingBox measured mid-animation). The theme honors
		// prefers-reduced-motion (scroll-behavior: auto), so force it.
		contextOptions: {reducedMotion: 'reduce'},
	},
	webServer: [
		{
			command: 'pnpm --filter @tweeq/docs exec vite --port 5174 --strictPort',
			url: 'http://localhost:5174',
			reuseExistingServer: true,
			stdout: 'ignore',
		},
		{
			command:
				'pnpm --filter @tweeq/playground-vue exec vite --port 5175 --strictPort',
			url: 'http://localhost:5175',
			reuseExistingServer: true,
			stdout: 'ignore',
		},
		{
			command:
				'pnpm --filter @tweeq/playground-react exec vite --port 5176 --strictPort',
			url: 'http://localhost:5176',
			reuseExistingServer: true,
			stdout: 'ignore',
		},
		{
			command:
				'pnpm exec vuepress dev docs --port 5177 --host 127.0.0.1',
			url: 'http://localhost:5177/vue/',
			reuseExistingServer: true,
			stdout: 'ignore',
		},
	],
})
