import {expect, test} from '@playwright/test'

test('tabs, generated forms, panes, and modal delegates work', async ({
	page,
}) => {
	await page.goto('/#/all-components')

	const tabs = page.getByTestId('Tabs')
	const firstTab = tabs.getByRole('tab', {name: 'First'})
	const secondTab = tabs.getByRole('tab', {name: 'Second'})
	await secondTab.click()
	await expect(tabs.getByText('Second panel')).toBeVisible()
	await secondTab.press('ArrowLeft')
	await expect(firstTab).toBeFocused()
	await expect(firstTab).toHaveAttribute('tabindex', '0')
	await expect(secondTab).toHaveAttribute('tabindex', '-1')
	await expect(tabs.getByText('First panel')).toBeVisible()
	const firstPanel = tabs.getByRole('tabpanel').filter({hasText: 'First panel'})
	await expect(firstPanel).toHaveAttribute(
		'aria-labelledby',
		(await firstTab.getAttribute('id')) ?? '',
	)

	const complex = page.getByTestId('InputComplex')
	await complex.locator('input').first().fill('27')
	await expect(page.getByTestId('complex-value')).toContainText('"amount":27')

	await page.getByTestId('PaneExpandable').getByRole('button').click()
	await expect(page.getByTestId('expandable-content')).toBeVisible()

	const split = page.getByTestId('split-control')
	const firstPane = split.locator(':scope > div').first()
	const divider = split.locator(':scope > div').nth(1)
	await divider.scrollIntoViewIfNeeded()
	const before = await firstPane.boundingBox()
	const dividerBox = await divider.boundingBox()
	if (!before || !dividerBox) throw new Error('Split pane was not measurable')
	await expect(divider).toHaveAttribute('role', 'separator')
	await expect(divider).toHaveAttribute('aria-orientation', 'vertical')
	await divider.focus()
	await divider.press('ArrowRight')
	await expect
		.poll(async () => (await firstPane.boundingBox())?.width)
		.toBeGreaterThan(before.width)
	const afterKeyboard = await firstPane.boundingBox()
	if (!afterKeyboard) throw new Error('Keyboard-resized split pane was not measurable')
	const dividerAfterKeyboard = await divider.boundingBox()
	if (!dividerAfterKeyboard) throw new Error('Split divider was not measurable')
	const dividerX = dividerAfterKeyboard.x + dividerAfterKeyboard.width / 2
	await page.mouse.move(
		dividerX,
		dividerAfterKeyboard.y + dividerAfterKeyboard.height / 2,
	)
	await page.mouse.down()
	await page.mouse.move(
		dividerX + 30,
		dividerAfterKeyboard.y + dividerAfterKeyboard.height / 2,
		{steps: 3},
	)
	await page.mouse.up()
	await expect
		.poll(async () => (await firstPane.boundingBox())?.width)
		.not.toBe(afterKeyboard.width)

	await page.getByRole('button', {name: 'Open plain modal'}).click()
	await expect(page.getByText('Plain modal content')).toBeVisible()
	await page.getByRole('button', {name: 'Close plain modal'}).click()

	await page.getByRole('button', {name: 'Open generated modal'}).click()
	const generatedModal = page.locator('.TqPaneModal:popover-open')
	await expect(generatedModal.getByText('Edit values')).toBeVisible()
	await generatedModal.locator('input').first().fill('Updated')
	await generatedModal.getByRole('button', {name: 'Save'}).click()
	await expect(page.getByTestId('modal-complex-value')).toHaveText('Updated')

	await page.getByRole('button', {name: 'Open tabbed modal'}).click()
	const tabbedModal = page.locator('.TqPaneModal:popover-open')
	await expect(tabbedModal.getByRole('tab', {name: 'Motion'})).toBeVisible()
	await tabbedModal.getByRole('button', {name: 'Done'}).click()
	await expect(page.getByTestId('modal-tabs-value')).toHaveText('true')

	const floating = page.getByTestId('PaneFloating')
	await floating.getByRole('button', {name: 'Toggle floating pane'}).click()
	await expect(floating.getByText('Floating pane', {exact: true})).toBeVisible()
	await expect(
		page.getByTestId('PaneZUI').getByRole('button', {name: 'Canvas node'})
	).toBeVisible()
	await expect(
		page.getByTestId('App').getByText('Embedded application content')
	).toBeVisible()
})
