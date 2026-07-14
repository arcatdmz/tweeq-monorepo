import {expect, type Page, test} from '@playwright/test'

async function publishedPageGeometry(page: Page) {
	return page.locator('[vp-content]').evaluate(root => {
		const rootRect = root.getBoundingClientRect()
		const round = (value: number) => Math.round(value * 64) / 64
		const box = (element: Element) => {
			const rect = element.getBoundingClientRect()
			const style = getComputedStyle(element)
			return {
				fontSize: style.fontSize,
				height: round(rect.height),
				lineHeight: style.lineHeight,
				padding: style.padding,
				width: round(rect.width),
				x: round(rect.x - rootRect.x),
				y: round(rect.y - rootRect.y),
			}
		}
		return {
			demos: [...root.querySelectorAll('.DemoComponent')].map(demo => ({
				box: box(demo),
				id: demo.previousElementSibling?.id,
				input: box(demo.querySelector('.input')!),
				options: box(demo.querySelector('.options')!),
			})),
			headings: [...root.querySelectorAll('h1, h2, h3')].map(heading => ({
				box: box(heading),
				id: heading.id,
				text: heading.textContent?.trim(),
			})),
			root: box(root),
		}
	})
}

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

test('Components page directly matches the published reference contract', async ({
	browser,
}) => {
	test.skip(
		process.env.VERIFY_PUBLISHED_REFERENCE !== '1',
		'Set VERIFY_PUBLISHED_REFERENCE=1 for the live baku89.github.io comparison.',
	)
	test.setTimeout(120_000)
	const context = await browser.newContext({
		viewport: {width: 1440, height: 900},
		reducedMotion: 'reduce',
	})
	const published = await context.newPage()
	const local = await context.newPage()
	await Promise.all([
		published.goto('https://baku89.github.io/tweeq/components.html', {
			waitUntil: 'networkidle',
		}),
		local.goto('/#/components', {waitUntil: 'networkidle'}),
	])
	await Promise.all([
		published.evaluate(() => document.fonts.ready),
		local.evaluate(() => document.fonts.ready),
	])

	const [publishedGeometry, localGeometry] = await Promise.all([
		publishedPageGeometry(published),
		publishedPageGeometry(local),
	])
	expect(localGeometry.root).toEqual(publishedGeometry.root)
	expect(localGeometry.headings).toEqual(publishedGeometry.headings)
	expect(localGeometry.demos.map(({id}) => id)).toEqual(
		publishedGeometry.demos.map(({id}) => id),
	)

	for (const localDemo of localGeometry.demos) {
		const publishedDemo = publishedGeometry.demos.find(
			({id}) => id === localDemo.id,
		)!
		expect(localDemo.box, localDemo.id).toEqual(publishedDemo.box)
		expect(localDemo.options, localDemo.id).toEqual(publishedDemo.options)
		if (localDemo.id === 'inputstring') {
			// The deployed Vue page hydrates InputString to an empty comment. Keep
			// the documented source fixture usable while matching its surrounding
			// published geometry.
			expect(publishedDemo.input.height).toBe(0)
			expect(localDemo.input).toEqual({...publishedDemo.input, height: 24})
		} else {
			expect(localDemo.input, localDemo.id).toEqual(publishedDemo.input)
		}
	}

	await context.close()
})
