import {expect, test} from '@playwright/test'

test('number and vector controls update controlled values', async ({page}) => {
	await page.goto('/#/all-components')

	const numberInput = page.getByTestId('InputNumber').locator('input')
	await numberInput.fill('42')
	await expect(page.getByTestId('number-value')).toHaveText('42')
	await numberInput.blur()
	const numberBox = await page
		.getByTestId('InputNumber')
		.locator('div')
		.first()
		.boundingBox()
	if (!numberBox) throw new Error('InputNumber did not produce a box')
	await page.mouse.move(numberBox.x + numberBox.width * 0.25, numberBox.y + 10)
	await page.mouse.down()
	await page.mouse.move(numberBox.x + numberBox.width * 0.75, numberBox.y + 10)
	await page.mouse.up()
	await expect(page.getByTestId('number-value')).not.toHaveText('42')

	const vecInput = page.getByTestId('InputVec').locator('input').first()
	await vecInput.fill('8')
	await expect(page.getByTestId('vec-value')).toHaveText('[8,2,3]')

	const sizeInput = page.getByTestId('InputSize').locator('input').first()
	await sizeInput.fill('200')
	await expect(page.getByTestId('size-value')).toHaveText('[200,100]')

	const positionInput = page
		.getByTestId('InputPosition')
		.locator('input')
		.first()
	await positionInput.fill('15')
	await expect(page.getByTestId('position-value')).toHaveText('[15,20]')

	const translateButton = page.getByTestId('InputTranslate').getByRole('button')
	await translateButton.scrollIntoViewIfNeeded()
	await expect(translateButton).toBeVisible()
})
