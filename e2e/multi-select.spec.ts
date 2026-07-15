import {expect, type Locator, type Page, test} from '@playwright/test'

async function exerciseKeyboardActions({
	page,
	section,
	output,
}: {
	page: Page
	section: Locator
	output: Locator
}) {
	const inputs = section.locator('input')
	await inputs.first().focus()
	await page.keyboard.down('Control')
	await inputs.nth(1).focus()
	await page.keyboard.up('Control')

	const popup = page.locator(
		'[data-tq-component="multi-select-popup"][data-tq-visible]',
	)
	await expect(popup).toBeVisible()

	const add = popup.getByRole('slider', {name: 'Add to selected values'})
	await expect(add).toHaveAttribute('aria-valuemin', '-100')
	await expect(add).toHaveAttribute('aria-valuemax', '100')
	await expect(add).toHaveAttribute('aria-valuenow', '0')
	await add.focus()
	await expect(add).toBeFocused()
	await expect
		.poll(async () => (await popup.boundingBox())?.width ?? 0)
		.toBeGreaterThan(30)
	expect(await add.evaluate(element => getComputedStyle(element).boxShadow)).not.toBe(
		'none',
	)

	await add.press('ArrowRight')
	await expect(add).toHaveAttribute('aria-valuenow', '1')
	await expect(output).toHaveText('11,21')
	await add.press('Shift+ArrowRight')
	await expect(add).toHaveAttribute('aria-valuenow', '11')
	await expect(output).toHaveText('21,31')

	const pad = popup.getByRole('application', {name: 'Adjust selected pair'})
	await pad.focus()
	await expect(pad).toHaveAttribute(
		'aria-roledescription',
		'two-axis relative adjustment',
	)
	await pad.press('ArrowRight')
	await expect(output).toHaveText('22,31')
	await pad.press('ArrowUp')
	await expect(output).toHaveText('22,32')
	await pad.press('Escape')
	await expect(output).toHaveText('21,31')
}

test('React and Vue multi-select actions share keyboard behavior', async ({page}) => {
	await page.goto('/all-components.html')
	await exerciseKeyboardActions({
		page,
		section: page.getByTestId('MultiSelectPopup'),
		output: page.getByTestId('multi-select-value'),
	})

	await page.goto('http://localhost:5175/')
	await exerciseKeyboardActions({
		page,
		section: page.locator('[data-gallery-component="MultiSelectPopup"]'),
		output: page.getByTestId('vue-multi-select-value'),
	})
})
