import {expect, type Locator, type Page, test} from '@playwright/test'

async function expectColorDragPalette(page: Page, control: Locator) {
	await control.scrollIntoViewIfNeeded()
	const box = await control.boundingBox()
	if (!box) throw new Error('InputColor swatch was not measurable')
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
	await page.mouse.down()
	await page.waitForTimeout(550)

	const overlay = page.locator('[data-tq-component="input-color-pad-overlay"]')
	await expect(overlay).toBeVisible()
	for (const part of ['overlay-pad', 'wheel']) {
		const palette = overlay.locator(`[data-tq-part="${part}"]`)
		await expect(palette).toBeVisible()
		expect((await palette.boundingBox())?.width ?? 0).toBeGreaterThan(100)
	}

	await page.mouse.up()
	await expect(overlay).toHaveCount(0)
}

test('Home exposes visible React and Vue choices', async ({page}) => {
	await page.goto('/#/home')

	const galleryNavigation = page.getByRole('navigation', {
		name: 'Renderer galleries',
	})
	await expect(
		galleryNavigation.getByRole('link', {name: /React gallery/}),
	).toHaveAttribute('href', '#/all-components')
	await expect(
		galleryNavigation.getByRole('link', {name: /Vue gallery/}),
	).toHaveAttribute('href', 'http://127.0.0.1:5175/')

	const active = page.locator('.framework-switcher [aria-pressed="true"]')
	const colors = await active.evaluate(element => {
		const style = getComputedStyle(element)
		return {background: style.backgroundColor, foreground: style.color}
	})
	expect(colors.background).not.toBe('rgba(0, 0, 0, 0)')
	expect(colors.foreground).not.toBe(colors.background)
})

test('React embedded gallery resists docs CSS and keeps drag/modal interactions actionable', async ({
	page,
}) => {
	await page.goto('/#/all-components')

	const rendererNavigation = page.getByRole('navigation', {
		name: 'Renderer comparison',
	})
	await expect(
		rendererNavigation.getByRole('link', {name: 'React gallery'}),
	).toHaveAttribute('aria-current', 'page')
	await expect(
		rendererNavigation.getByRole('link', {name: 'Vue gallery'}),
	).toHaveAttribute('href', 'http://127.0.0.1:5175/')

	for (const selector of [
		'[data-testid="InputRadio"] [data-tq-component="input-radio"]',
		'[data-testid="Menu"] [data-tq-component="menu"]',
	]) {
		const style = await page.locator(selector).evaluate(element => {
			const computed = getComputedStyle(element)
			return {
				listStyle: computed.listStyleType,
				marginBlock: `${computed.marginTop} ${computed.marginBottom}`,
			}
		})
		expect(style).toEqual({listStyle: 'none', marginBlock: '0px 0px'})
	}

	for (const selector of [
		'[data-testid="InputRadio"] [data-tq-component="input-radio"] > li[data-tq-part]',
		'[data-testid="Menu"] [data-tq-component="menu"] > li[data-tq-part]',
		'[data-tq-component="parameter-grid"] > li[data-tq-component]',
		'[data-tq-component="tabs"] [data-tq-part="tablist"] > li[data-tq-part]',
	]) {
		const styles = await page.locator(selector).evaluateAll(elements =>
			elements.map(element => {
				const computed = getComputedStyle(element)
				const before = getComputedStyle(element, '::before')
				return {
					marginBlock: `${computed.marginTop} ${computed.marginBottom}`,
					marker: before.content,
				}
			}),
		)
		expect(styles.length, `${selector} should match owned list items`).toBeGreaterThan(0)
		for (const style of styles) {
			expect(style).toEqual({marginBlock: '0px 0px', marker: 'none'})
		}
	}

	await page
		.getByTestId('InputDropdown')
		.locator('[data-tq-component="input-dropdown"]')
		.click()
	const optionBoxes = await page
		.locator('[data-tq-component="input-dropdown-list"] [data-tq-option]')
		.evaluateAll(options =>
			options.slice(0, 2).map(option => option.getBoundingClientRect().toJSON()),
		)
	expect(optionBoxes[1].top - optionBoxes[0].bottom).toBeLessThanOrEqual(0.5)
	const dropdownOptionStyles = await page
		.locator('[data-tq-component="input-dropdown-list"] [data-tq-option]')
		.evaluateAll(options =>
			options.map(option => ({
				marginBottom: getComputedStyle(option).marginBottom,
				marker: getComputedStyle(option, '::before').content,
			})),
		)
	for (const style of dropdownOptionStyles) {
		expect(style).toEqual({marginBottom: '0px', marker: 'none'})
	}
	await page.keyboard.press('Escape')

	await expectColorDragPalette(
		page,
		page
			.getByTestId('InputColor')
			.locator('[data-tq-component="input-color-pad"]'),
	)

	const modalButton = page.getByRole('button', {name: 'Open tabbed modal'})
	await modalButton.scrollIntoViewIfNeeded()
	const modalButtonBox = await modalButton.boundingBox()
	if (!modalButtonBox) throw new Error('Tabbed modal button was not measurable')
	await page.mouse.click(
		modalButtonBox.x + modalButtonBox.width - 3,
		modalButtonBox.y + modalButtonBox.height / 2,
	)
	const modal = page.locator('.TqPaneModal:popover-open')
	await expect(modal.getByRole('tab', {name: 'Motion'})).toBeVisible()
	await modal.getByRole('button', {name: 'Done'}).click()
})

test('Vue gallery matches the usable React demonstrations', async ({page}) => {
	await page.goto('http://localhost:5175/')

	const rendererNavigation = page.getByRole('navigation', {
		name: 'Renderer comparison',
	})
	await expect(
		rendererNavigation.getByRole('link', {name: 'React gallery'}),
	).toHaveAttribute('href', 'http://127.0.0.1:5174/#/all-components')
	await expect(
		rendererNavigation.getByRole('link', {name: 'Vue gallery'}),
	).toHaveAttribute('aria-current', 'page')

	const titlePositions = await page
		.locator('[data-tq-component="title-bar"]')
		.evaluateAll(elements => elements.map(element => getComputedStyle(element).position))
	expect(titlePositions).toEqual(['absolute', 'relative'])
	const titleIconMasks = await page
		.locator(
			'[data-tq-component="title-bar"] [data-tq-component="color-icon"]',
		)
		.evaluateAll(elements =>
			elements.map(element => getComputedStyle(element).maskImage),
		)
	expect(titleIconMasks).toHaveLength(2)
	for (const mask of titleIconMasks) expect(mask).toContain('data:image/svg+xml')

	const color = page.locator(
		'[data-gallery-component="InputColor"] [data-tq-component="input-color"]',
	)
	const colorLayout = await color.evaluate(element => ({
		height: element.getBoundingClientRect().height,
		tops: Array.from(element.children).map(
			child => child.getBoundingClientRect().top,
		),
	}))
	expect(colorLayout.height).toBeLessThanOrEqual(30)
	expect(Math.max(...colorLayout.tops) - Math.min(...colorLayout.tops)).toBeLessThan(1)
	await expectColorDragPalette(
		page,
		color.locator('[data-tq-component="input-color-pad"]'),
	)

	const expandable = page.locator('[data-gallery-component="PaneExpandable"]')
	await expandable.getByRole('button').click()
	await expect(page.getByTestId('expandable-content')).toBeVisible()

	const floating = page.locator('[data-gallery-component="PaneFloating"]')
	await floating.getByRole('button', {name: 'Toggle floating pane'}).click()
	const floatingPane = floating.locator('[data-tq-component="pane-floating"]')
	await expect(floatingPane).toBeVisible()
	await expect(floatingPane).toHaveCSS('position', 'relative')

	await page.getByRole('button', {name: 'Open generated modal'}).click()
	let modal = page.locator('.TqPaneModal:popover-open')
	await modal.locator('input').first().fill('Updated')
	await modal.getByRole('button', {name: 'Save'}).click()
	await expect(page.getByTestId('modal-complex-value')).toHaveText('Updated')

	await page.getByRole('button', {name: 'Open tabbed modal'}).click()
	modal = page.locator('.TqPaneModal:popover-open')
	await expect(modal.getByRole('tab', {name: 'Motion'})).toBeVisible()
	await modal.getByRole('button', {name: 'Done'}).click()
	await expect(page.getByTestId('modal-tabs-value')).toContainText('closed at')

	const overlayTrigger = page.getByTestId('tweak-overlay-trigger')
	await overlayTrigger.dispatchEvent('pointerdown')
	await expect(page.getByTestId('tweak-overlay-content')).toBeVisible()
	await overlayTrigger.dispatchEvent('pointerup')
	await expect(page.getByTestId('tweak-overlay')).toHaveCount(0)
})
