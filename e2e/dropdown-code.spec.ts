import {expect, test} from '@playwright/test'

test('dropdown, command palette, code, and markdown work', async ({page}) => {
	await page.goto('/#/all-components')

	const dropdown = page.getByTestId('InputDropdown').locator('input')
	await dropdown.click()
	await page.getByRole('option', {name: 'Beta'}).click()
	await expect(page.getByTestId('dropdown-value')).toHaveText('beta')

	await page.keyboard.press('Control+P')
	const palette = page.locator('.TqCommandPalette')
	await expect(palette).toBeVisible()
	await palette.locator('input').fill('Increment demo')
	await palette.locator('input').press('Enter')
	await expect(page.getByTestId('palette-value')).toHaveText('1')

	await expect(
		page.getByTestId('MonacoEditor').locator('.monaco-editor')
	).toBeVisible()
	await expect(
		page.getByTestId('InputCode').locator('.monaco-editor')
	).toBeVisible()
	await expect(
		page
			.getByTestId('Markdown')
			.getByRole('heading', {name: 'Rendered heading'})
	).toBeVisible()
	await expect(
		page.getByTestId('Markdown').getByRole('link', {name: 'Tweeq'})
	).toHaveAttribute('href', 'https://example.com')
})
