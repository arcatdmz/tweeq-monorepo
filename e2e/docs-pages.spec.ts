import {expect, test} from '@playwright/test'

test('documentation navigation switches React pages', async ({page}) => {
	await page.goto('/')
	await expect(page.getByTestId('home-page')).toBeVisible()
	await expect(page.getByRole('heading', {name: 'React', exact: true})).toBeVisible()
	await expect(page.getByRole('heading', {name: 'Vue', exact: true})).toBeVisible()
	await expect(page.getByRole('link', {name: 'baku89/tweeq'})).toHaveAttribute('href', 'https://github.com/baku89/tweeq')
	await expect(page.getByRole('banner').getByRole('link', {name: 'All Components'})).toHaveCount(0)
	await page.getByRole('main').getByRole('link', {name: 'Example', exact: true}).click()
	await expect(page).toHaveURL(/\/example\.html$/)
	await expect(page.getByTestId('examples-page')).toBeVisible()
	await page.getByRole('link', {name: 'Features'}).click()
	await expect(page.getByRole('heading', {name: 'Expression Support'})).toBeVisible()
})

test('home links to the gallery without altering the published Components page', async ({
	page,
}) => {
	await page.goto('/')
	const galleryLink = page
		.getByRole('main')
		.getByRole('link', {name: /React gallery/})
	await expect(galleryLink).toBeVisible()
	await galleryLink.click()
	await expect(page).toHaveURL(/\/all-components\.html$/)
	await expect(page.getByRole('heading', {name: 'All Components'})).toBeVisible()
	await expect(page.getByRole('main').getByRole('link', {name: 'Components page'})).toBeVisible()
})

test('Many Sliders edits update the live JSON value', async ({page}) => {
	await page.goto('/example.html')
	const example = page.getByTestId('many-sliders')
	// Case.capital('number1') === 'Number1' — matches the legacy Vue labels.
	// exact: substring matching would also hit the JSON readout <pre>.
	await expect(example.getByText('Number1', {exact: true})).toBeVisible()
	// InputNumber overlays its <input> with inactive content until focused, so
	// a direct click fails Playwright's actionability check. Focus programmatically
	// (Tab-focus is a supported entry path), then type.
	const input = example.locator('input').first()
	await input.focus()
	await input.press('ControlOrMeta+A')
	await input.pressSequentially('42')
	await input.press('Enter')
	await expect(page.getByTestId('many-sliders-value')).toContainText('42')
})

test('default route, clickable nav, theme toggle, and sidebar behave like docs chrome', async ({page}) => {
	await page.goto('/')
	await expect(page.getByTestId('home-page')).toBeVisible()
	await expect(page.getByRole('link', {name: 'Home', exact: true})).toHaveCSS('cursor', 'pointer')
	// VuePress-style toggle: accessible name from title, drives html[data-theme]
	const before = await page.locator('html').getAttribute('data-theme')
	await page.getByRole('button', {name: 'toggle color mode'}).click()
	await expect(page.locator('html')).not.toHaveAttribute(
		'data-theme',
		before ?? ''
	)
	await page.goto('/features.html')
	const sidebarLink = page.getByRole('complementary').getByRole('link', {name: 'Expression Support'})
	await sidebarLink.click()
	await expect(page).toHaveURL(/\/features\.html#expression-support$/)
	await expect(page.locator('#expression-support')).toBeInViewport()
})

test('research routes render React demos and select the Vue renderer', async ({page}) => {
	await page.goto('/uist2025.html')
	await expect(page.getByTestId('uist2025-page')).toBeVisible()
	await expect(page.getByRole('heading', {name: /Parameter-Tuning GUI Widgets/})).toBeVisible()
	await expect(page.getByRole('navigation', {name: 'Renderer example'}).getByRole('link', {name: 'Vue'})).toHaveAttribute('href', 'http://127.0.0.1:5177/vue/uist2025.html')
	await page.goto('/presentation.html')
	await expect(page.getByTestId('presentation-page')).toBeVisible()
	await page.goto('/user-study.html')
	await expect(page.getByTestId('user-study-page')).toBeVisible()
	await page.goto('/user-study-components.html')
	await expect(page.getByTestId('user-study-components-page')).toBeVisible()
})

test('Colors page renders the generated swatches', async ({page}) => {
	await page.goto('/colors.html')
	await expect(page.getByTestId('colors-page')).toBeVisible()
	await expect(page.getByTestId('color-swatch')).toHaveCount(24)
	await expect(page.getByText('error / alert / rec')).toBeVisible()
	const appearance = page.locator('.color-controls label').first()
	await expect(
		appearance.locator('[data-tq-radio-label]').getByText('Light')
	).toBeVisible()
	await expect(
		appearance.locator('[data-tq-radio-label]').getByText('Dark')
	).toBeVisible()
	await expect(appearance.locator('[data-tq-radio-label] svg')).toHaveCount(2)
})
