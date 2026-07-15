import {readFileSync} from 'node:fs'

import {expect, test} from '@playwright/test'

const componentBarrel = readFileSync('packages/react/src/index.ts', 'utf8')
const publicModules = [
	...new Set(
		[...componentBarrel.matchAll(/from '\.\/components\/([^']+)'/g)].map(
			match => match[1],
		),
	),
]

test('React playground renders every public component module without errors', async ({
	page,
}) => {
	const errors: string[] = []
	page.on('pageerror', error => errors.push(error.message))
	page.on('console', message => {
		if (message.type() === 'error') errors.push(message.text())
	})

	await page.goto('http://localhost:5176/')
	await expect(page.getByTestId('react-component-gallery')).toBeVisible()
	const rendered = await page
		.locator('[data-gallery-component]')
		.evaluateAll(elements =>
			elements.map(element => element.getAttribute('data-gallery-component')),
		)
	for (const name of publicModules) expect(rendered).toContain(name)
	await expect(
		page.locator('[data-gallery-component="MonacoEditor"] .monaco-editor'),
	).toBeVisible()

	const number = page.locator('[data-gallery-component="InputNumber"] input')
	await number.focus()
	await number.press('ControlOrMeta+A')
	await number.pressSequentially('42')
	await number.press('Enter')
	await expect(number).toHaveValue('42')

	expect(errors).toEqual([])
})
