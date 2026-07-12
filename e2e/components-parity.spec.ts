import {expect, test} from '@playwright/test'

test('Components page keeps short controls visually faithful to Vue', async ({
	page,
}) => {
	await page.goto('/#/components')

	const checkbox = page.locator('[class*="tqInputCheckbox"]').first()
	await checkbox.click()
	await expect(checkbox.locator('svg')).toBeVisible()

	const dropdown = page.locator('[class*="tqInputDropdown"]').first()
	await dropdown.locator('input').click()
	const list = page.getByRole('listbox')
	await expect(list).toBeVisible()
	await expect(
		list.locator('xpath=..').locator('[class*="scrollArrow"]')
	).toHaveCount(0)

	const chain = page.locator('[class*="tqInputSize"]').first().getByRole('button')
	await chain.scrollIntoViewIfNeeded()
	await expect(chain.locator('svg')).toHaveCSS('width', '24px')
	await expect(chain.locator('svg')).toHaveCSS('height', '24px')
})
