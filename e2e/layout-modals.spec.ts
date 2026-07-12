import {expect, test} from '@playwright/test'

test('tabs, generated forms, panes, and modal delegates work', async ({
	page,
}) => {
	await page.goto('/')

	const tabs = page.getByTestId('Tabs')
	await tabs.getByRole('tab', {name: 'Second'}).click()
	await expect(tabs.getByText('Second panel')).toBeVisible()

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
	const dividerX = dividerBox.x + dividerBox.width / 2
	await page.mouse.move(dividerX, dividerBox.y + dividerBox.height / 2)
	await page.mouse.down()
	await page.mouse.move(dividerX + 30, dividerBox.y + dividerBox.height / 2, {
		steps: 3,
	})
	await page.mouse.up()
	await expect
		.poll(async () => (await firstPane.boundingBox())?.width)
		.not.toBe(before.width)

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

	await expect(
		page.getByTestId('PaneFloating').getByText('Floating pane')
	).toBeVisible()
	await expect(
		page.getByTestId('PaneZUI').getByRole('button', {name: 'Canvas node'})
	).toBeVisible()
	await expect(
		page.getByTestId('App').getByText('Embedded app content')
	).toBeVisible()
})
