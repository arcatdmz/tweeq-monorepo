import {expect, test} from '@playwright/test'

test('temporal and rotary controls render and update', async ({page}) => {
	await page.goto('/')

	const angleInput = page.getByTestId('InputAngle').locator('input')
	await angleInput.fill('90')
	await expect(page.getByTestId('angle-value')).toHaveText('90')

	const timeInput = page.getByTestId('InputTime').locator('input')
	await timeInput.fill('2s')
	await expect(page.getByTestId('time-value')).toHaveText('48')

	const drum = page.getByTestId('InputDrum').locator('[tabindex="0"]')
	await drum.focus()
	await drum.press('ArrowRight')
	await expect(page.getByTestId('drum-value')).toHaveText('100')

	await expect(
		page.getByTestId('InputRotary').getByRole('button')
	).toBeVisible()

	const timeline = page.getByTestId('Timeline').locator('div').nth(2)
	await timeline.hover()
	await page.keyboard.down('Alt')
	await page.mouse.wheel(0, 120)
	await page.keyboard.up('Alt')
	await expect(page.getByTestId('timeline-width')).not.toHaveText('20.00')
})
