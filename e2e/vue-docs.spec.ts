import {expect, test} from '@playwright/test'

const vueDocs = 'http://localhost:5177/vue'

for (const [file, heading] of [
	['features.html', 'Features'],
	['components.html', 'Components'],
	['colors.html', 'Colors'],
	['example.html', 'Examples'],
] as const) {
	test(`Vue documentation renders ${file}`, async ({page}) => {
		await page.goto(`${vueDocs}/${file}`)
		await expect(page.getByRole('heading', {name: heading, level: 1})).toBeVisible()
		await expect(page.getByRole('link', {name: 'React'})).toHaveAttribute(
			'href',
			`/${file}`,
		)
	})
}

test('renderer switch preserves the documentation slug in both directions', async ({page}) => {
	await page.goto('/components.html')
	await expect(page.getByRole('link', {name: 'View Components with Vue'})).toHaveAttribute(
		'href',
		'http://127.0.0.1:5177/vue/components.html',
	)

	await page.goto(`${vueDocs}/all-components.html`)
	const gallery = page.getByTestId('vue-component-gallery')
	await expect(gallery).toBeVisible()
	await expect(gallery).not.toHaveClass(/standalone-gallery-page/)
	expect((await gallery.boundingBox())?.width).toBeGreaterThan(800)
	const viewport = gallery.locator(':scope > .all-components')
	await expect(viewport).toHaveClass(/TqViewport/)
	await expect(viewport).toHaveAttribute('data-tq-component', 'viewport')
	await expect(
		viewport.locator('[data-gallery-component="InputAngle"] [data-tq-component="input-angle"]'),
	).toHaveCSS('font-size', '12px')
	await expect(page.getByRole('link', {name: 'React'}).first()).toHaveAttribute(
		'href',
		'/all-components.html',
	)
})
