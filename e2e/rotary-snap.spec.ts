import {expect, type Page,test} from '@playwright/test'

async function angleValue(page: Page) {
	return Number(await page.getByTestId('angle-value').textContent())
}

test('InputAngle snaps from live keys and the radial meter without jitter', async ({
	page,
}) => {
	await page.goto('/#/all-components')
	const rotary = page.getByTestId('InputAngle').getByRole('button')
	// Raw page.mouse coordinates don't auto-scroll like locator.click() does;
	// without this the knob sits below the fold and the drag hits <html>.
	await rotary.scrollIntoViewIfNeeded()
	const box = await rotary.boundingBox()
	if (!box) throw new Error('InputAngle rotary has no bounds')
	const center = {x: box.x + box.width / 2, y: box.y + box.height / 2}

	await page.keyboard.down('Shift')
	await page.mouse.move(center.x + 4, center.y)
	await page.mouse.down()
	await page.mouse.move(center.x + 120, center.y)
	await expect(page.locator('[data-tq-part="arrows"]')).toBeVisible()
	await page.mouse.move(center.x, center.y + 120, {steps: 8})
	expect((await angleValue(page)) % 45).toBe(0)
	await page.mouse.move(center.x - 120, center.y, {steps: 8})
	expect((await angleValue(page)) % 45).toBe(0)

	await page.keyboard.up('Shift')
	// Must also LEAVE the radial snap band (radius 96–160 px) — staying inside
	// it keeps snapping active regardless of keys, matching the legacy meter.
	await page.mouse.move(center.x - 40, center.y - 56, {steps: 4})
	expect((await angleValue(page)) % 45).not.toBe(0)
	await page.mouse.up()

	await page.mouse.move(center.x + 4, center.y)
	await page.mouse.down()
	await page.mouse.move(center.x + 120, center.y)
	await page.mouse.move(center.x, center.y + 120, {steps: 8})
	expect((await angleValue(page)) % 45).toBe(0)
	await page.mouse.move(center.x - 120, center.y, {steps: 8})
	expect((await angleValue(page)) % 45).toBe(0)
	await page.mouse.up()
})
