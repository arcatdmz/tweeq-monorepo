import {expect, type Page, test} from '@playwright/test'

async function showInputSize(page: Page, theme: 'light' | 'dark') {
	await page.goto('/#/components')
	if ((await page.locator('html').getAttribute('data-theme')) !== theme) {
		await page.getByRole('button', {name: 'toggle color mode'}).click()
	}
	await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
	const demo = page.locator('#inputsize + .DemoComponent')
	await demo.scrollIntoViewIfNeeded()
	await expect(demo).toBeVisible()
	return demo
}

test('InputSize representative state is stable in light and dark themes', async ({
	page,
}) => {
	await expect(await showInputSize(page, 'light')).toHaveScreenshot(
		'input-size-light.png'
	)
	await expect(await showInputSize(page, 'dark')).toHaveScreenshot(
		'input-size-dark.png'
	)
})

test('InputSize representative state is stable at mobile width', async ({page}) => {
	await page.setViewportSize({width: 320, height: 844})
	await expect(await showInputSize(page, 'light')).toHaveScreenshot(
		'input-size-mobile.png'
	)
})
