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

	// Click the rendered neighbor item itself: coordinate offsets like width/4
	// span multiple cells (~58px each) and select whatever item sits there.
	// Click at the visible '200' cell's coordinates: the drum root
	// intentionally intercepts all pointer events (drag + coordinate-based
	// click-to-select), so locator.click on the cell fails actionability.
	// (The matching <span>s are hidden width-measurement elements — the
	// visible items are the cell <div>s.)
	const cellBox = await drum
		.locator('div')
		.filter({hasText: /^200$/})
		.boundingBox()
	if (!cellBox) throw new Error('Drum cell was not measurable')
	await page.mouse.click(
		cellBox.x + cellBox.width / 2,
		cellBox.y + cellBox.height / 2
	)
	await expect(page.getByTestId('drum-value')).toHaveText('200')
	const drumBox = await drum.boundingBox()
	if (!drumBox) throw new Error('Drum was not measurable')
	await page.mouse.move(
		drumBox.x + drumBox.width / 2,
		drumBox.y + drumBox.height / 2
	)
	await page.mouse.down()
	// Big leftward drag: advances past the remaining option and clamps on the
	// last one ('400') regardless of exact cell width.
	await page.mouse.move(
		drumBox.x + drumBox.width / 2 - 150,
		drumBox.y + drumBox.height / 2,
		{steps: 6}
	)
	await page.mouse.up()
	await expect(page.getByTestId('drum-value')).toHaveText('400')

	const timeRoot = page.getByTestId('InputTime').locator('[class*="tqInputTime"]')
	// Raw mouse coordinates don't auto-scroll; measure only in-viewport.
	await timeRoot.scrollIntoViewIfNeeded()
	const timeBox = await timeRoot.boundingBox()
	if (!timeBox) throw new Error('Time input was not measurable')
	await page.mouse.move(
		timeBox.x + timeBox.width / 2,
		timeBox.y + timeBox.height / 2
	)
	await page.mouse.down()
	await page.mouse.move(timeBox.x + timeBox.width / 2 + 12, timeBox.y + 10)
	await expect(page.locator('[class*="overlaySvg"]')).toBeVisible()
	await page.mouse.up()

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
