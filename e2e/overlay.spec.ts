import {expect, test} from '@playwright/test'

test('overlay stack renders and performs commands', async ({page}) => {
	await page.goto('/#/all-components')

	const balloonPath = page.getByTestId('balloon-root').locator('svg path')
	await expect(balloonPath).not.toHaveAttribute('d', '')

	await page.getByRole('button', {name: 'Toggle popover'}).click()
	await expect(page.getByTestId('popover-content')).toBeVisible()
	expect(
		await page
			.getByTestId('popover-content')
			.evaluate(element =>
				element.closest('[popover]')?.matches(':popover-open')
			)
	).toBe(true)

	await page.getByTestId('Menu').getByText('Run command').click()
	await expect(page.getByTestId('menu-result')).toHaveText('run')

	await page.getByRole('button', {name: 'Hover for tooltip'}).hover()
	await expect(page.getByText('Hover help')).toBeVisible()
	await expect(page.getByText('Shared tooltip root')).toBeVisible()
})
