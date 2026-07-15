import {viteBundler} from '@vuepress/bundler-vite'
import {defaultTheme} from '@vuepress/theme-default'
import glsl from 'vite-plugin-glsl'
import {defineUserConfig} from 'vuepress'

export default defineUserConfig({
	title: 'Tweeq',
	base: process.env.TWEEQ_VUE_DOCS_BASE ?? '/vue/',
	pagePatterns: [
		'**/*.md',
		'!README.md',
		'!architecture/**',
		'!migration.md',
	],
	head: [
		['link', {rel: 'icon', href: './logo.svg'}],
		['link', {rel: 'preconnect', href: 'https://fonts.googleapis.com'}],
		[
			'link',
			{rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true},
		],
		[
			'link',
			{
				rel: 'stylesheet',
				href: 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap',
			},
		],
		[
			'script',
			{
				src: 'https://jspm.dev/@spectrum-web-components/bundle/elements.js',
				type: 'module',
				async: true,
			},
		],
	],
	theme: defaultTheme({
		navbar: [
			{
				text: 'Home',
				link: '/',
			},
			{
				text: 'Features',
				link: '/features',
			},
			{
				text: 'Components',
				link: '/components',
			},
			{
				text: 'Colors',
				link: '/colors',
			},
			{
				text: 'Example',
				link: '/example',
			},
			{
				text: 'All Components',
				link: '/all-components',
			},
		],
		logo: './logo.svg',
		repo: 'baku89/tweeq',
	}),
	locales: {
		'/': {
			lang: 'en-US',
			description:
				'Tweeq documentation rendered with Vue',
		},
	},
	bundler: viteBundler({
		viteOptions: {
			plugins: [glsl() as any],
			build: {
				ssr: false,
			},
			ssr: {
				noExternal: ['paper', 'paper-jsdom', '@baku89/pave'],
				external: ['paper', 'paper-jsdom', '@baku89/pave'],
			},
		},
	}),
	markdown: {
		linkify: true,
		typographer: true,
	},
})
