import {expect, test} from '@playwright/test'

test('React primitives render, enter the top layer, and interact', async ({
	page,
}) => {
	await page.goto('/all-components.html')

	const background = await page
		.locator('body')
		.evaluate(element =>
			getComputedStyle(element).getPropertyValue('--tq-color-background').trim()
		)
	expect(background).not.toBe('')

	await expect(page.getByTestId('iconify-icon')).toHaveJSProperty(
		'tagName',
		'svg'
	)
	await expect(page.getByTestId('fill-icon')).toHaveJSProperty('tagName', 'svg')
	await expect(
		page.getByTestId('InputGroup').locator('button').nth(0)
	).toHaveAttribute('data-inline-position', 'start')
	await expect(
		page.getByTestId('InputGroup').locator('button').nth(1)
	).toHaveAttribute('data-inline-position', 'middle')
	await expect(
		page.getByTestId('InputGroup').locator('button').nth(2)
	).toHaveAttribute('data-inline-position', 'end')
	await expect(page.getByTestId('tweak-overlay')).toHaveCount(0)
	await page.getByTestId('tweak-overlay-trigger').dispatchEvent('pointerdown')
	expect(
		await page
			.getByTestId('tweak-overlay')
			.evaluate(element => element.matches(':popover-open'))
	).toBe(true)
	await expect(page.getByTestId('tweak-overlay-content')).toHaveText(
		'Intentional tweak gesture overlay'
	)
	await page.getByTestId('tweak-overlay-trigger').dispatchEvent('pointerup')
	await expect(page.getByTestId('tweak-overlay')).toHaveCount(0)

	await page.getByTestId('indicator-control').click()
	await expect(page.getByTestId('indicator-value')).toHaveText('true')
})
