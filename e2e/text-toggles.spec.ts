import {expect, test} from '@playwright/test'

test('text and toggle inputs update controlled values', async ({page}) => {
	await page.goto('/#/all-components')

	const stringInput = page.getByTestId('InputString').locator('input')
	await stringInput.fill('updated')
	await expect(page.getByTestId('string-value')).toHaveText('updated')

	await page.getByTestId('InputButton').getByRole('button').click()
	await expect(page.getByTestId('button-count')).toHaveText('1')

	await page.getByRole('button', {name: 'Toggle button'}).click()
	await expect(page.getByTestId('button-toggle-value')).toHaveText('true')

	await page.getByTestId('InputSwitch').locator('div').nth(1).click()
	await expect(page.getByTestId('switch-value')).toHaveText('true')

	await page.getByTestId('InputCheckbox').locator('div').nth(1).click()
	await expect(page.getByTestId('checkbox-value')).toHaveText('true')

	await page
		.getByTestId('InputRadio')
		.locator('[data-tq-radio-label]')
		.filter({hasText: 'Beta'})
		.click()
	await expect(page.getByTestId('radio-value')).toHaveText('beta')

	await page.getByTestId('InputShuffle').getByRole('button').click()
	await expect(page.getByTestId('shuffle-value')).toHaveText('2')
})
