import {expect, test} from '@playwright/test'

test('demo app boots', async ({page}) => {
	await page.goto('/')
	// Default route is the All Components gallery under the docs-site chrome.
	await expect(
		page.getByRole('banner').getByRole('link', {name: 'Tweeq'})
	).toBeVisible()
	await expect(page.getByTestId('components-page')).toBeVisible()
})
