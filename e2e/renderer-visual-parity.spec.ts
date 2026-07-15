import {writeFile} from 'node:fs/promises'

import {expect, type Locator, type Page, test} from '@playwright/test'

import {gallerySectionOrder} from '../apps/shared/galleryFixtures'

const MATCHED_COMPONENTS = [
	'App',
	'Balloon',
	'BindIcon',
	'ColorIcon',
	'GlslCanvas',
	'Icon',
	'IconIndicator',
	'InputAngle',
	'InputButton',
	'InputButtonToggle',
	'InputCheckbox',
	'InputCode',
	'InputColor',
	'InputComplex',
	'InputCubicBezier',
	'InputDropdown',
	'InputDrum',
	'InputGroup',
	'InputNumber',
	'InputPosition',
	'InputRadio',
	'InputRotary',
	'InputShuffle',
	'InputSize',
	'InputString',
	'InputSwitch',
	'InputTextBase',
	'InputTime',
	'InputTranslate',
	'InputVec',
	'Menu',
	'MonacoEditor',
	'MultiSelectPopup',
	'PaneExpandable',
	'PaneFloating',
	'PaneModal',
	'PaneModalComplex',
	'PaneModalTabs',
	'PaneSplit',
	'PaneZUI',
	'ParameterGrid',
	'Ruler',
	'SvgIcon',
	'Tabs',
	'Timeline',
	'TitleBar',
	'Tooltip',
	'Viewport',
] as const

async function preparePage(page: Page, url: string, isolate = true) {
	await page.goto(url)
	await page.waitForLoadState('networkidle')
	await page.evaluate(() => document.fonts.ready)
	await page.locator('.monaco-editor .view-lines').nth(1).waitFor()
	if (!isolate) return
	await page.evaluate(() => {
		const gallery = document.querySelector<HTMLElement>(
			'[data-testid$="component-gallery"]',
		)
		const viewport = gallery?.matches('[data-tq-component="viewport"]')
			? gallery
			: gallery?.closest<HTMLElement>('[data-tq-component="viewport"]')
		if (viewport) document.body.append(viewport)
	})
}

async function pinFixture(section: Locator, width: number) {
	await section.evaluate((element, fixtureWidth) => {
		let backdrop = document.querySelector<HTMLElement>(
			'[data-renderer-visual-backdrop]'
		)
		if (!backdrop) {
			backdrop = document.createElement('div')
			backdrop.dataset.rendererVisualBackdrop = ''
			document.body.append(backdrop)
		}
		backdrop.style.cssText =
			'position:fixed;inset:0;z-index:99998;background:white'
		const parent = element.parentElement
		if (parent?.matches('[data-gallery-component]')) {
			parent.style.display = ''
			for (const sibling of parent.parentElement?.children ?? []) {
				if (sibling !== parent && sibling.matches('[data-gallery-component]')) {
					;(sibling as HTMLElement).style.display = 'none'
				}
			}
		} else {
			for (const sibling of element.parentElement?.children ?? []) {
				if (
					sibling !== element &&
					sibling.matches('section[data-gallery-component]')
				) {
					;(sibling as HTMLElement).style.display = 'none'
				}
			}
		}

		const fixture = element as HTMLElement
		fixture.style.cssText = [
			'position: fixed',
			'left: 0',
			'top: 0',
			`width: ${fixtureWidth}px`,
			'margin: 0',
			'z-index: 99999',
			'background: white',
		].join(';')
		for (const auxiliary of fixture.querySelectorAll(
			':scope > h2, :scope > p, :scope > output'
		)) {
			;(auxiliary as HTMLElement).style.display = 'none'
		}
	}, width)
}

async function stabilizeVisualState(page: Page) {
	const viewport = page.viewportSize()
	if (viewport) await page.mouse.move(viewport.width - 1, viewport.height - 1)
	await page.evaluate(() => {
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur()
		}
	})
}

async function setOpaqueVisualBackground(target: Locator) {
	await target.evaluate(element => {
		const root = element as HTMLElement
		root.style.setProperty('background', 'white')
		root
			.querySelector<HTMLElement>('[data-tq-part="panels-wrapper"]')
			?.style.setProperty('background', 'white')
	})
}

async function imagesArePixelEquivalent(
	page: Page,
	reactImage: Buffer,
	vueImage: Buffer
) {
	if (reactImage.equals(vueImage)) return true
	return page.evaluate(
		async ({reactBase64, vueBase64}) => {
			const decode = async (base64: string) => {
				const response = await fetch(`data:image/png;base64,${base64}`)
				return createImageBitmap(await response.blob())
			}
			const [reactBitmap, vueBitmap] = await Promise.all([
				decode(reactBase64),
				decode(vueBase64),
			])
			if (
				reactBitmap.width !== vueBitmap.width ||
				reactBitmap.height !== vueBitmap.height
			) return false

			const pixels = (bitmap: ImageBitmap) => {
				const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
				const context = canvas.getContext('2d')!
				context.drawImage(bitmap, 0, 0)
				return context.getImageData(0, 0, bitmap.width, bitmap.height).data
			}
			const reactPixels = pixels(reactBitmap)
			const vuePixels = pixels(vueBitmap)
			// Allow only a microscopic antialiased-edge rounding difference. Any
			// geometry mismatch, meaningful color delta, or broad pixel drift fails.
			let antialiasPixels = 0
			for (let index = 0; index < reactPixels.length; index += 4) {
				let maximumDelta = 0
				for (let channel = 0; channel < 4; channel += 1) {
					maximumDelta = Math.max(
						maximumDelta,
						Math.abs(
							reactPixels[index + channel] - vuePixels[index + channel]
						)
					)
				}
			// Rounded controls can produce a handful of subpixel edge samples with
			// a larger channel delta even when their geometry is identical. The
			// strict affected-pixel budget below prevents masking a real drift.
			if (maximumDelta > 48) return false
				if (maximumDelta > 1) antialiasPixels += 1
			}
			return (
				antialiasPixels <=
				Math.max(4, Math.floor(reactBitmap.width * reactBitmap.height * 0.002))
			)
		},
		{
			reactBase64: reactImage.toString('base64'),
			vueBase64: vueImage.toString('base64'),
		}
	)
}

async function imageDifference(
	page: Page,
	reactImage: Buffer,
	vueImage: Buffer,
) {
	return page.evaluate(
		async ({reactBase64, vueBase64}) => {
			const decode = async (base64: string) => {
				const response = await fetch(`data:image/png;base64,${base64}`)
				return createImageBitmap(await response.blob())
			}
			const [reactBitmap, vueBitmap] = await Promise.all([
				decode(reactBase64),
				decode(vueBase64),
			])
			if (
				reactBitmap.width !== vueBitmap.width ||
				reactBitmap.height !== vueBitmap.height
			) {
				return {
					differentPixels: Number.POSITIVE_INFINITY,
					height: vueBitmap.height,
					maximumDelta: 255,
					width: vueBitmap.width,
				}
			}

			const pixels = (bitmap: ImageBitmap) => {
				const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
				const context = canvas.getContext('2d')!
				context.drawImage(bitmap, 0, 0)
				return context.getImageData(0, 0, bitmap.width, bitmap.height).data
			}
			const reactPixels = pixels(reactBitmap)
			const vuePixels = pixels(vueBitmap)
			let differentPixels = 0
			let maximumDelta = 0
			for (let index = 0; index < reactPixels.length; index += 4) {
				let pixelDelta = 0
				for (let channel = 0; channel < 4; channel += 1) {
					pixelDelta = Math.max(
						pixelDelta,
						Math.abs(
							reactPixels[index + channel] - vuePixels[index + channel],
						),
					)
				}
				if (pixelDelta > 0) differentPixels += 1
				maximumDelta = Math.max(maximumDelta, pixelDelta)
			}
			return {
				differentPixels,
				height: reactBitmap.height,
				maximumDelta,
				width: reactBitmap.width,
			}
		},
		{
			reactBase64: reactImage.toString('base64'),
			vueBase64: vueImage.toString('base64'),
		},
	)
}

test('React and Vue galleries share their complete shell, order, and layout', async ({
	browser,
}, testInfo) => {
	test.setTimeout(120_000)
	const context = await browser.newContext({
		viewport: {width: 715, height: 900},
		deviceScaleFactor: 1,
		colorScheme: 'light',
		reducedMotion: 'reduce',
	})
	const react = await context.newPage()
	const vue = await context.newPage()
	await Promise.all([
		preparePage(react, '/#/all-components', false),
		preparePage(vue, 'http://localhost:5175/', false),
	])
	await Promise.all([
		react
			.locator('[data-gallery-component="Icon"] [data-testid="iconify-icon"] path')
			.waitFor(),
		vue
			.locator('[data-gallery-component="Icon"] [data-testid="iconify-icon"] path')
			.waitFor(),
	])

	const galleryContract = (page: Page, renderer: 'react' | 'vue') =>
		page.evaluate(rendererName => {
			const root = document.querySelector<HTMLElement>(
				rendererName === 'react'
					? '[data-testid="react-component-gallery"]'
					: '[data-testid="vue-component-gallery"] .all-components',
			)!
			const entries = [...root.children]
				.filter((element): element is HTMLElement =>
					element.matches('[data-gallery-component]'),
				)
				.map(owner => {
					const section = owner.matches('section')
						? owner
						: owner.querySelector<HTMLElement>(':scope > section')!
					return {
						heading: section.querySelector(':scope > h2')?.textContent?.trim(),
						name: owner.dataset.galleryComponent,
					}
				})
			const panePaths = [
				...root.querySelectorAll<SVGPathElement>(
					'[data-gallery-component="PaneExpandable"] [data-tq-component="pane-expandable"] path[d]',
				),
			].map(path => path.getAttribute('d'))
			return {entries, panePaths}
		}, renderer)

	const [reactContract, vueContract] = await Promise.all([
		galleryContract(react, 'react'),
		galleryContract(vue, 'vue'),
	])
	expect(reactContract.entries.map(({name}) => name)).toEqual([
		...gallerySectionOrder,
	])
	expect(vueContract.entries).toEqual(reactContract.entries)
	expect(reactContract.panePaths.length).toBeGreaterThan(0)
	expect(vueContract.panePaths).toEqual(reactContract.panePaths)

	const normalizeShell = (page: Page) =>
		page.evaluate(() => {
			const links = document.querySelectorAll('.renderer-switcher a')
			links[0].setAttribute('aria-current', 'page')
			links[1].removeAttribute('aria-current')
			for (const chrome of document.querySelectorAll(
				'.vp-navbar, .vp-sidebar, .vp-sidebar-mask',
			)) {
				;(chrome as HTMLElement).style.setProperty('display', 'none', 'important')
			}
		})
	await Promise.all([normalizeShell(react), normalizeShell(vue)])

	const visualContract = (page: Page, renderer: 'react' | 'vue') =>
		page.evaluate(rendererName => {
			const root = document.querySelector<HTMLElement>(
				rendererName === 'react'
					? '[data-testid="react-component-gallery"]'
					: '[data-testid="vue-component-gallery"] .all-components',
			)!
			const round = (value: number) => Math.round(value * 64) / 64
			const box = (element: Element) => {
				const rect = element.getBoundingClientRect()
				return {
					height: round(rect.height),
					width: round(rect.width),
					x: round(rect.x),
					y: round(rect.y),
				}
			}
			const styleProperties = [
				'backgroundColor',
				'border',
				'borderRadius',
				'color',
				'display',
				'fontFamily',
				'fontSize',
				'fontVariant',
				'fontWeight',
				'gap',
				'lineHeight',
				'padding',
			] as const
			const style = (selector: string) => {
				const computed = getComputedStyle(document.querySelector(selector)!)
				return Object.fromEntries(
					styleProperties.map(property => [property, computed[property]]),
				)
			}
			const sections = [...root.children]
				.filter((element): element is HTMLElement =>
					element.matches('[data-gallery-component]'),
				)
				.map(owner => {
					const section = owner.matches('section')
						? owner
						: owner.querySelector<HTMLElement>(':scope > section')!
					return {box: box(section), name: owner.dataset.galleryComponent}
				})
			return {
				boxes: {
					header: box(document.querySelector('.gallery-header')!),
					heading: box(document.querySelector('.gallery-header h1')!),
					page: box(document.querySelector('.renderer-gallery-page')!),
					paragraph: box(document.querySelector('.gallery-header p')!),
					root: box(root),
					switcher: box(document.querySelector('.renderer-switcher')!),
				},
				sections,
				styles: {
					heading: style('.gallery-header h1'),
					paragraph: style('.gallery-header p'),
					switcher: style('.renderer-switcher'),
					switcherActive: style('.renderer-switcher a[aria-current]'),
					switcherInactive: style('.renderer-switcher a:not([aria-current])'),
				},
			}
		}, renderer)

	const [reactVisual, vueVisual] = await Promise.all([
		visualContract(react, 'react'),
		visualContract(vue, 'vue'),
	])
	expect(vueVisual).toEqual(reactVisual)

	const [reactImage, vueImage] = await Promise.all([
		react
			.locator('.renderer-gallery-page')
			.screenshot({animations: 'disabled', caret: 'hide'}),
		vue
			.locator('.renderer-gallery-page')
			.screenshot({animations: 'disabled', caret: 'hide'}),
	])
	const difference = await imageDifference(react, reactImage, vueImage)
	const pixelBudget = Math.ceil(difference.width * difference.height * 0.0001)
	if (difference.differentPixels > pixelBudget) {
		await Promise.all([
			testInfo.attach('whole-gallery-react', {
				body: reactImage,
				contentType: 'image/png',
			}),
			testInfo.attach('whole-gallery-vue', {
				body: vueImage,
				contentType: 'image/png',
			}),
		])
	}
	expect(difference).toMatchObject({width: 715})
	expect(difference.differentPixels).toBeLessThanOrEqual(pixelBudget)

	await context.close()
})

const VIEWPORT_CASES = [
	{name: 'light desktop', colorScheme: 'light', width: 928},
	{name: 'dark desktop', colorScheme: 'dark', width: 928},
	{name: 'light mobile', colorScheme: 'light', width: 320},
] as const

for (const visualCase of VIEWPORT_CASES) test(`React and Vue render matched component fixtures pixel-for-pixel in ${visualCase.name}`, async ({
	browser,
}, testInfo) => {
	test.setTimeout(120_000)
	const context = await browser.newContext({
		viewport: {
			width: visualCase.width === 320 ? 320 : 1440,
			height: 900,
		},
		deviceScaleFactor: 1,
		colorScheme: visualCase.colorScheme,
		reducedMotion: 'reduce',
	})
	const react = await context.newPage()
	const vue = await context.newPage()
	await Promise.all([
		preparePage(react, '/#/all-components'),
		preparePage(vue, 'http://localhost:5175/'),
	])

	const mismatches: string[] = []
	for (const name of MATCHED_COMPONENTS) {
		const reactSection = react.locator(
			`[data-gallery-component="${name}"] > section`,
		)
		const vueSection = vue.locator(
			`section[data-gallery-component="${name}"]`,
		)
		await Promise.all([
			pinFixture(reactSection, visualCase.width),
			pinFixture(vueSection, visualCase.width),
		])
		await Promise.all([
			stabilizeVisualState(react),
			stabilizeVisualState(vue),
		])

		const reactTarget = reactSection.locator('[data-tq-component]').first()
		const vueTarget = vueSection.locator('[data-tq-component]').first()
		if (name === 'Tabs') {
			await Promise.all([
				setOpaqueVisualBackground(reactTarget),
				setOpaqueVisualBackground(vueTarget),
			])
		}
		const reactImage = await reactTarget.screenshot({
			animations: 'disabled',
			caret: 'hide',
		})
		const vueImage = await vueTarget.screenshot({
			animations: 'disabled',
			caret: 'hide',
		})
		if (!(await imagesArePixelEquivalent(react, reactImage, vueImage))) {
			mismatches.push(name)
			const reactPath = testInfo.outputPath(`${name}-react.png`)
			const vuePath = testInfo.outputPath(`${name}-vue.png`)
			await Promise.all([
				writeFile(reactPath, reactImage),
				writeFile(vuePath, vueImage),
			])
			await Promise.all([
				testInfo.attach(`${name}-react`, {
					path: reactPath,
					contentType: 'image/png',
				}),
				testInfo.attach(`${name}-vue`, {
					path: vuePath,
					contentType: 'image/png',
				}),
			])
		}
	}

	await context.close()
	expect(mismatches).toEqual([])
})

test('React and Vue gallery hosts give Markdown the same typography', async ({
	browser,
}) => {
	const context = await browser.newContext({
		viewport: {width: 1440, height: 900},
		colorScheme: 'light',
	})
	const react = await context.newPage()
	const vue = await context.newPage()
	await Promise.all([
		react.goto('/#/all-components'),
		vue.goto('http://localhost:5175/'),
	])

	const properties = [
		'marginTop',
		'marginBottom',
		'paddingTop',
		'fontFamily',
		'fontSize',
		'fontWeight',
		'lineHeight',
		'color',
		'textDecoration',
	] as const
	const styles = (page: Page, section: string) =>
		page.locator(`${section} [data-tq-component="markdown"]`).evaluate(
			(root, styleProperties) =>
				['h1', 'p', 'a'].map(selector => {
					const style = getComputedStyle(root.querySelector(selector)!)
					return Object.fromEntries(
						styleProperties.map(property => [property, style[property]])
					)
				}),
			properties
		)

	await expect(
		styles(vue, 'section[data-gallery-component="Markdown"]')
	).resolves.toEqual(await styles(react, '[data-testid="Markdown"]'))
	await context.close()
})

const INTERACTION_STATES: {
	name: string
	component: string
	activate: (page: Page, section: Locator) => Promise<void>
	target: (page: Page, section: Locator) => Locator
}[] = [
	{
		name: 'active button toggle',
		component: 'InputButtonToggle',
		activate: async (_page, section) => {
			const button = section.getByRole('button')
			await button.click()
			await expect(button).toHaveAttribute('aria-pressed', 'true')
		},
		target: (_page, section) =>
			section.locator('[data-tq-component="input-button-toggle"]'),
	},
	{
		name: 'checked checkbox',
		component: 'InputCheckbox',
		activate: async (_page, section) => {
			const checkbox = section.locator(
				'[data-tq-component="input-checkbox"]'
			)
			await checkbox.locator('[data-tq-part="track"]').click()
			await expect(checkbox.locator('input')).toBeChecked()
		},
		target: (_page, section) =>
			section.locator('[data-tq-component="input-checkbox"]'),
	},
	{
		name: 'open color picker',
		component: 'InputColor',
		activate: async (_page, section) => section.getByRole('button').first().click(),
		target: (page) =>
			page
				.getByRole('button', {name: 'Use #00ff88'})
				.locator('xpath=ancestor::*[@popover][1]'),
	},
	{
		name: 'open cubic-bezier picker',
		component: 'InputCubicBezier',
		activate: async (_page, section) => section.getByRole('button').click(),
		target: (page) =>
			page
				.locator('[popover]:popover-open circle')
				.first()
				.locator('xpath=ancestor::*[@popover][1]'),
	},
	{
		name: 'open dropdown',
		component: 'InputDropdown',
		activate: async (page, section) => {
			await section.locator('input').click()
			await expect(page.getByRole('option', {name: 'Alpha'})).toHaveAttribute(
				'aria-selected',
				'true',
			)
		},
		target: (page) =>
			page.getByRole('listbox').locator('xpath=ancestor::*[@popover][1]'),
	},
	{
		name: 'selected radio option',
		component: 'InputRadio',
		activate: async (_page, section) => {
			const option = section
				.locator('[data-tq-radio-label]')
				.filter({hasText: 'Beta'})
			await option.click()
			await expect(section.getByRole('radio', {name: 'Beta'})).toBeChecked()
		},
		target: (_page, section) =>
			section.locator('[data-tq-component="input-radio"]'),
	},
	{
		name: 'active switch',
		component: 'InputSwitch',
		activate: async (_page, section) => {
			const inputSwitch = section.locator(
				'[data-tq-component="input-switch"]'
			)
			await inputSwitch.locator('[data-tq-part="track"]').click()
			await expect(inputSwitch.locator('input')).toBeChecked()
		},
		target: (_page, section) =>
			section.locator('[data-tq-component="input-switch"]'),
	},
	{
		name: 'expanded pane',
		component: 'PaneExpandable',
		activate: async (_page, section) => section.getByRole('button').click(),
		target: (_page, section) =>
			section.locator('[data-tq-component="pane-expandable"]'),
	},
	{
		name: 'open floating pane',
		component: 'PaneFloating',
		activate: async (_page, section) =>
			section.getByRole('button', {name: 'Toggle floating pane'}).click(),
		target: (_page, section) =>
			section.locator('[data-tq-component="pane-floating"]'),
	},
	{
		name: 'open plain modal',
		component: 'PaneModal',
		activate: async (_page, section) =>
			section.getByRole('button', {name: 'Open plain modal'}).click(),
		target: (page) => page.locator('.TqPaneModal:popover-open'),
	},
	{
		name: 'open standalone popover',
		component: 'Popover',
		activate: async (_page, section) =>
			section.getByRole('button', {name: 'Toggle popover'}).click(),
		target: (page) =>
			page
				.getByTestId('popover-content')
				.locator('xpath=ancestor::*[@popover][1]'),
	},
	{
		name: 'second tab selected',
		component: 'Tabs',
		activate: async (_page, section) => {
			const tab = section.getByRole('tab', {name: 'Second'})
			await tab.click()
			await expect(tab).toHaveAttribute('aria-selected', 'true')
		},
		target: (_page, section) =>
			section.locator('[data-tq-component="tabs"]'),
	},
	{
		name: 'visible tweak overlay',
		component: 'TweakOverlay',
		activate: async (_page, section) =>
			section.getByTestId('tweak-overlay-trigger').dispatchEvent('pointerdown'),
		target: (page) =>
			page.locator('[data-tq-component="tweak-overlay"]:popover-open'),
	},
]

test('React and Vue render matched interactive states pixel-for-pixel', async ({
	browser,
}, testInfo) => {
	test.setTimeout(120_000)
	const context = await browser.newContext({
		viewport: {width: 1440, height: 900},
		deviceScaleFactor: 1,
		colorScheme: 'light',
		reducedMotion: 'reduce',
	})
	const react = await context.newPage()
	const vue = await context.newPage()
	await Promise.all([
		preparePage(react, '/#/all-components', false),
		preparePage(vue, 'http://localhost:5175/', false),
	])

	const mismatches: string[] = []
	for (const state of INTERACTION_STATES) {
		const reactSection = react.locator(
			`[data-gallery-component="${state.component}"] > section`
		)
		const vueSection = vue.locator(
			`section[data-gallery-component="${state.component}"]`
		)
		await Promise.all([
			pinFixture(reactSection, 360),
			pinFixture(vueSection, 360),
		])
		await Promise.all([
			stabilizeVisualState(react),
			stabilizeVisualState(vue),
		])
		// Input actions across two pages share one browser focus. Run them in
		// sequence so one page cannot steal pointer/keyboard focus mid-click.
		await state.activate(react, reactSection)
		await state.activate(vue, vueSection)
		await Promise.all([
			react.evaluate(() => (document.activeElement as HTMLElement)?.blur()),
			vue.evaluate(() => (document.activeElement as HTMLElement)?.blur()),
		])

		const reactTarget = state.target(react, reactSection)
		const vueTarget = state.target(vue, vueSection)
		await Promise.all([reactTarget.waitFor(), vueTarget.waitFor()])
		if (state.component === 'Tabs' || state.component === 'TweakOverlay') {
			await Promise.all([
				setOpaqueVisualBackground(reactTarget),
				setOpaqueVisualBackground(vueTarget),
			])
		}
		const [reactImage, vueImage] = await Promise.all([
			reactTarget.screenshot({animations: 'disabled', caret: 'hide'}),
			vueTarget.screenshot({animations: 'disabled', caret: 'hide'}),
		])
		if (!(await imagesArePixelEquivalent(react, reactImage, vueImage))) {
			mismatches.push(state.name)
			const reactPath = testInfo.outputPath(`${state.name}-react.png`)
			const vuePath = testInfo.outputPath(`${state.name}-vue.png`)
			await Promise.all([
				writeFile(reactPath, reactImage),
				writeFile(vuePath, vueImage),
			])
			await Promise.all([
				testInfo.attach(`${state.name}-react`, {
					path: reactPath,
					contentType: 'image/png',
				}),
				testInfo.attach(`${state.name}-vue`, {
					path: vuePath,
					contentType: 'image/png',
				}),
			])
		}
		if (state.component === 'TweakOverlay') {
			await Promise.all([
				reactSection
					.getByTestId('tweak-overlay-trigger')
					.dispatchEvent('pointerup'),
				vueSection
					.getByTestId('tweak-overlay-trigger')
					.dispatchEvent('pointerup'),
			])
		}
		const closePopovers = (page: Page) =>
			page.locator('[popover]:popover-open').evaluateAll(elements => {
				for (const element of elements) (element as HTMLElement).hidePopover()
			})
		await Promise.all([closePopovers(react), closePopovers(vue)])
		await Promise.all([
			expect(react.locator('[popover]:popover-open')).toHaveCount(0),
			expect(vue.locator('[popover]:popover-open')).toHaveCount(0),
		])
	}

	await context.close()
	expect(mismatches).toEqual([])
})
