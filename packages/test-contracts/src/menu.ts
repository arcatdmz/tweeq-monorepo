import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface MenuContractProps {
	items: Array<
		| {kind: 'item'; label: string; shortLabel?: string}
		| {kind: 'separator'}
	>
}

export function runMenuContract(
	createHarness: RendererHarnessFactory<MenuContractProps>
) {
	describe('Menu renderer contract', () => {
		let harness: RendererHarness<MenuContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('renders commands, short labels, separators, and stable parts', async () => {
			harness = await createHarness('Menu', {
				items: [
					{kind: 'item', label: 'Long label', shortLabel: 'Short'},
					{kind: 'separator'},
					{kind: 'item', label: 'Second'},
				],
			})
			const root = harness.part('root') as HTMLElement
			expect(harness.part('separator')).not.toBeNull()
			expect(
				Array.from(root.querySelectorAll('[data-tq-part="label"]')).map(label =>
					label.textContent?.trim()
				)
			).toEqual(['Short', 'Second'])
		})

		it('performs a command and closes the menu chain', async () => {
			harness = await createHarness('Menu', {
				items: [{kind: 'item', label: 'Run'}],
			})
			await harness.activate('item')
			expect(harness.events()).toEqual([
				{name: 'perform', payload: ['Run']},
				{name: 'close', payload: []},
			])
		})

		it('follows controlled item updates', async () => {
			harness = await createHarness('Menu', {
				items: [{kind: 'item', label: 'Before'}],
			})
			await harness.update({items: [{kind: 'item', label: 'After'}]})
			expect(harness.part('label')?.textContent?.trim()).toBe('After')
		})
	})
}
