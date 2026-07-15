import {expect, type Page, test} from '@playwright/test'

async function expectNoPageOverflow(page: Page) {
	await expect
		.poll(() =>
			page.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth + 1
			)
		)
		.toBe(true)
}

test.use({viewport: {width: 320, height: 844}})

test('mobile docs keep navigation and demos within the viewport', async ({
	page,
}) => {
	await page.goto('/')
	await expect(page.locator('.vp-navbar-items-wrapper .vp-hide-mobile')).toBeHidden()
	await expect(page.locator('.vp-site-name')).toBeHidden()
	await expect(page.locator('.vp-toggle-sidebar-button')).toBeVisible()
	await expectNoPageOverflow(page)

	await page.locator('.vp-toggle-sidebar-button').click()
	await expect(page.locator('.vp-theme-container')).toHaveClass(/sidebar-open/)
	await expect(page.locator('.vp-sidebar')).toBeInViewport()

	await page.goto('/components.html')
	const firstDemo = page.locator('.DemoComponent').first()
	await expect(firstDemo).toBeVisible()
	const columns = await firstDemo.evaluate(
		element => getComputedStyle(element).gridTemplateColumns
	)
	expect(columns.trim().split(/\s+/)).toHaveLength(1)
	await expectNoPageOverflow(page)
	await firstDemo.getByRole('button', {name: 'Full Screen'}).click()
	const fullscreen = firstDemo.locator('.input-wrapper.fullscreen')
	await expect(fullscreen).toBeVisible()
	const fullscreenBox = await fullscreen.boundingBox()
	expect(fullscreenBox?.width).toBeLessThanOrEqual(320 - 32)
	expect(fullscreenBox?.height).toBeLessThanOrEqual(844 - 32)
	await firstDemo.getByRole('button', {name: 'Exit Full Screen'}).click()

	await page.goto('/all-components.html')
	await expect(page.getByTestId('Ruler')).toBeVisible()
	await expectNoPageOverflow(page)
})

test('component option editors also stack at tablet width', async ({page}) => {
	await page.setViewportSize({width: 768, height: 1024})
	await page.goto('/components.html')
	const firstDemo = page.locator('.DemoComponent').first()
	const columns = await firstDemo.evaluate(
		element => getComputedStyle(element).gridTemplateColumns
	)
	expect(columns.trim().split(/\s+/)).toHaveLength(1)
	await expectNoPageOverflow(page)
})
