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
	await expect(page.getByTestId('vue-component-gallery')).toBeVisible()
	await expect(page.getByRole('link', {name: 'React'}).first()).toHaveAttribute(
		'href',
		'/all-components.html',
	)
})
