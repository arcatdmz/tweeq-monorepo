import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface PaneExpandableContractProps {
	controlled: boolean
	open?: boolean
}

export function runPaneExpandableContract(
	createHarness: RendererHarnessFactory<PaneExpandableContractProps>
) {
	describe('PaneExpandable renderer contract', () => {
		let harness: RendererHarness<PaneExpandableContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('updates internal state when uncontrolled', async () => {
			harness = await createHarness('PaneExpandable', {controlled: false})
			expect(harness.value()).toBe(false)
			await harness.activate('trigger')
			expect(harness.value()).toBe(true)
			expect(harness.events()).toEqual([{name: 'change', payload: [true]}])
		})

		it('does not mutate state when a controlled update is rejected', async () => {
			harness = await createHarness('PaneExpandable', {
				controlled: true,
				open: false,
			})
			await harness.activate('trigger')
			expect(harness.value()).toBe(false)
			expect(harness.events()).toEqual([{name: 'change', payload: [true]}])
		})
	})
}
