import {expect, test} from '@playwright/test'

test('GLSL, color, and cubic bezier controls work', async ({page}) => {
	await page.goto('/')

	await expect(page.getByTestId('GlslCanvas').locator('img')).toHaveAttribute(
		'src',
		/^data:image\/png/
	)

	await page.getByTestId('InputColor').locator('button').first().click()
	await page.getByRole('button', {name: 'Use #00ff88'}).click()
	await expect(page.getByTestId('color-value')).toHaveText('#00ff88')

	await page.getByTestId('InputCubicBezier').getByRole('button').click()
	const handle = page.locator('[popover]:popover-open circle').first()
	await expect(handle).toBeVisible()
	const box = await handle.boundingBox()
	if (!box) throw new Error('Cubic bezier handle was not measurable')
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
	await page.mouse.down()
	await page.mouse.move(box.x + 20, box.y - 20)
	await page.mouse.up()
	await expect(page.getByTestId('bezier-value')).not.toHaveText(
		'0.25,0.1,0.25,1'
	)
})
