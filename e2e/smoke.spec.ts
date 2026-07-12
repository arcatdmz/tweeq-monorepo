import {expect, test} from '@playwright/test'

test('demo app boots', async ({page}) => {
	await page.goto('/')
	await expect(
		page.getByRole('heading', {name: 'Tweeq React Demo'})
	).toBeVisible()
})
