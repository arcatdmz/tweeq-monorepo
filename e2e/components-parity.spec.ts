import {expect, test} from '@playwright/test'

test('Components page keeps short controls visually faithful to Vue', async ({
	page,
}) => {
	await page.goto('/#/components')

	const checkbox = page.locator('[data-tq-component="input-checkbox"]').first()
	await checkbox.click()
	await expect(checkbox.locator('svg')).toBeVisible()

	const dropdown = page.locator('[data-tq-component="input-dropdown"]').first()
	await dropdown.locator('input').click()
	const list = page.getByRole('listbox')
	await expect(list).toBeVisible()
	await expect(
		list.locator('xpath=..').locator('[data-tq-part="scroll-arrow"]')
	).toHaveCount(0)

	const chain = page
		.locator('[data-tq-component="input-size"]')
		.first()
		.getByRole('button')
	await chain.scrollIntoViewIfNeeded()
	await expect(chain.locator('svg')).toHaveCSS('width', '24px')
	await expect(chain.locator('svg')).toHaveCSS('height', '24px')
})

test('Components page preserves the published ground-truth demo geometry', async ({
	page,
}) => {
	await page.goto('/#/components')

	// These are the 13 controls that currently render in the published Vue
	// reference. Its InputString demo is an empty comment node, so that upstream
	// omission cannot define the expected local geometry.
	const publishedComponentIds = [
		'inputangle',
		'inputbutton',
		'inputcheckbox',
		'inputcolor',
		'inputdropdown',
		'inputdrum',
		'inputnumber',
		'inputposition',
		'inputradio',
		'inputsize',
		'inputswitch',
		'inputtime',
		'inputvec',
	]

	for (const id of publishedComponentIds) {
		const canvas = page.locator(`#${id} + .DemoComponent .input`).first()
		await expect(canvas, id).toHaveCSS('width', '240px')
		await expect(canvas, id).toHaveCSS('height', '24px')
	}

	// Preserve the intended source fixture even where the deployed reference is
	// broken: InputString renders its documented value instead of disappearing.
	const inputString = page.locator('#inputstring + .DemoComponent .input').first()
	await expect(inputString).toHaveCSS('width', '240px')
	await expect(inputString).toHaveCSS('height', '24px')
	await expect(inputString.locator('input')).toHaveValue('Baby salmon')
})
