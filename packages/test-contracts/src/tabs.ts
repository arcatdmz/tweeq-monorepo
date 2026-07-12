import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface TabsContractProps {
	tabs: readonly {id: string; name: string; disabled?: boolean}[]
}

export function runTabsContract(
	createHarness: RendererHarnessFactory<TabsContractProps>
) {
	describe('Tabs renderer contract', () => {
		let harness: RendererHarness<TabsContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('selects enabled tabs with native disabled and click lifecycle', async () => {
			harness = await createHarness('Tabs', {
				tabs: [
					{id: 'disabled', name: 'Disabled', disabled: true},
					{id: 'first', name: 'First'},
					{id: 'last', name: 'Last'},
				],
			})
			expect((harness.part('tab-disabled') as HTMLButtonElement).disabled).toBe(
				true
			)
			expect(harness.value()).toBe('first')
			expect(harness.events()).toEqual([{name: 'change', payload: ['first']}])

			await harness.activate('tab-disabled')
			expect(harness.value()).toBe('first')
			await harness.activate('tab-first')
			await harness.activate('tab-last')
			expect(harness.value()).toBe('last')
			expect(harness.events()).toEqual([
				{name: 'change', payload: ['first']},
				{name: 'click', payload: ['first']},
				{name: 'change', payload: ['last']},
			])
		})

		it('re-registers a changed tab id without losing selection', async () => {
			harness = await createHarness('Tabs', {
				tabs: [{id: 'before', name: 'Before'}],
			})
		await harness.update({tabs: [{id: 'after', name: 'After'}]})
			expect(harness.part('tab-before')).toBeNull()
			expect(harness.part('tab-after')).not.toBeNull()
			expect(harness.value()).toBe('after')
		})
	})
}
