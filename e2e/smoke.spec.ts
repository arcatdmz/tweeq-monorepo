import {expect, test} from '@playwright/test'

test('demo app boots', async ({page}) => {
	await page.goto('/all-components.html')
	// The component gallery remains available explicitly under the docs chrome.
	await expect(
		page.getByRole('banner').getByRole('link', {name: 'Tweeq'})
	).toBeVisible()
	await expect(page.getByTestId('components-page')).toBeVisible()
})
