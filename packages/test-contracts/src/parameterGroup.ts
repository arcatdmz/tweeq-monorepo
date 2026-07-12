import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface ParameterGroupContractProps {
	label: string
	icon?: string
}

export function runParameterGroupContract(
	createHarness: RendererHarnessFactory<ParameterGroupContractProps>
) {
	describe('ParameterGroup renderer contract', () => {
		let harness: RendererHarness<ParameterGroupContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('exposes a native persistent expand/collapse trigger', async () => {
			harness = await createHarness('ParameterGroup', {
				label: 'Camera',
				icon: 'material-symbols:photo-camera',
			})
			const trigger = harness.part('trigger') as HTMLButtonElement
			expect(trigger.tagName).toBe('BUTTON')
			expect(trigger.getAttribute('aria-expanded')).toBe('true')
			await harness.activate('trigger')
			expect(harness.value()).toBe(false)
			await harness.activate('trigger')
			expect(harness.value()).toBe(true)
			// Iconify schedules one async state pass; let it settle before teardown.
			await new Promise(resolve => setTimeout(resolve, 20))
		})
	})
}
