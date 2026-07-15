import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface TabsContractProps {
	tabs: readonly {id: string; name: string; disabled?: boolean}[]
	vertical?: boolean
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
			expect((harness.part('tab-disabled') as HTMLButtonElement).tabIndex).toBe(-1)
			expect((harness.part('tab-first') as HTMLButtonElement).tabIndex).toBe(0)
			expect((harness.part('tab-last') as HTMLButtonElement).tabIndex).toBe(-1)
			const firstTab = harness.part('tab-first') as HTMLButtonElement
			const firstPanel = harness.part('panel-first') as HTMLElement
			expect(firstTab.id).not.toBe('')
			expect(firstTab.getAttribute('aria-controls')).toBe(firstPanel.id)
			expect(firstPanel.getAttribute('aria-labelledby')).toBe(firstTab.id)
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
			const tabDomId = harness.part('tab-before')?.id
		await harness.update({tabs: [{id: 'after', name: 'After'}]})
			expect(harness.part('tab-before')).toBeNull()
			expect(harness.part('tab-after')).not.toBeNull()
			expect(harness.part('tab-after')?.id).toBe(tabDomId)
			expect(harness.value()).toBe('after')
		})

		it('uses roving focus and automatic orientation-aware keyboard activation', async () => {
			harness = await createHarness('Tabs', {
				vertical: true,
				tabs: [
					{id: 'first', name: 'First'},
					{id: 'disabled', name: 'Disabled', disabled: true},
					{id: 'last', name: 'Last'},
				],
			})
			await harness.key({type: 'press', key: 'ArrowDown'}, 'tab-first')
			expect(harness.value()).toBe('last')
			expect(document.activeElement).toBe(harness.part('tab-last'))
			expect((harness.part('tab-first') as HTMLButtonElement).tabIndex).toBe(-1)
			expect((harness.part('tab-last') as HTMLButtonElement).tabIndex).toBe(0)

			await harness.key({type: 'press', key: 'ArrowDown'}, 'tab-last')
			expect(harness.value()).toBe('first')
			await harness.key({type: 'press', key: 'End'}, 'tab-first')
			expect(harness.value()).toBe('last')
			await harness.key({type: 'press', key: 'Home'}, 'tab-last')
			expect(harness.value()).toBe('first')
			expect(harness.events()).toEqual([
				{name: 'change', payload: ['first']},
				{name: 'change', payload: ['last']},
				{name: 'change', payload: ['first']},
				{name: 'change', payload: ['last']},
				{name: 'change', payload: ['first']},
			])
		})
	})
}
