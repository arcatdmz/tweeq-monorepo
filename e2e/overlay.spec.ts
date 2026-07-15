import {expect, test} from '@playwright/test'

test('overlay stack renders and performs commands', async ({page}) => {
	await page.goto('/all-components.html')

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

	const menuSection = page.getByTestId('Menu')
	const menu = menuSection.getByRole('menu')
	const runCommand = menu.getByRole('menuitem', {name: /Run command/})
	await runCommand.focus()
	await runCommand.press('End')
	const more = menu.getByRole('menuitem', {name: 'More'})
	await expect(more).toBeFocused()
	await more.press('ArrowRight')
	await expect(page.getByRole('menuitem', {name: 'Nested command'})).toBeFocused()
	await page.keyboard.press('ArrowLeft')
	await expect(more).toBeFocused()
	await expect(menuSection.getByRole('menu')).toHaveCount(1)
	await more.press('ArrowRight')
	await page.keyboard.press('Enter')
	await expect(page.getByTestId('menu-result')).toHaveText('nested')

	await runCommand.click()
	await expect(page.getByTestId('menu-result')).toHaveText('run')

	await page.getByRole('button', {name: 'Hover for tooltip'}).hover()
	await expect(page.getByText('Hover help')).toBeVisible()
	await expect(page.getByText('Shared tooltip root')).toBeVisible()
})
