import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface IconIndicatorContractProps {
	active: boolean
	icon: string
}

export function runIconIndicatorContract(
	createHarness: RendererHarnessFactory<IconIndicatorContractProps>
) {
	describe('IconIndicator renderer contract', () => {
		let harness: RendererHarness<IconIndicatorContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('follows controlled active updates with pressed semantics', async () => {
			harness = await createHarness('IconIndicator', {active: false, icon: 'char:A'})
			const root = harness.part('root')

			expect(root?.getAttribute('role')).toBe('button')
			expect(root?.getAttribute('tabindex')).toBe('0')
			expect(root?.getAttribute('aria-pressed')).toBe('false')
			await harness.update({active: true})
			expect(root?.getAttribute('aria-pressed')).toBe('true')
		})

		it('activates by pointer and keyboard', async () => {
			harness = await createHarness('IconIndicator', {active: false, icon: 'char:A'})

			await harness.activate('root')
			await harness.key({type: 'press', key: 'Enter'}, 'root')

			expect(harness.events()).toEqual([
				{name: 'change', payload: [true]},
				{name: 'change', payload: [false]},
			])
		})

		it('exposes stable root and icon parts', async () => {
			harness = await createHarness('IconIndicator', {active: false, icon: 'char:A'})

			expect(harness.part('root')).not.toBeNull()
			expect(harness.part('icon')?.textContent).toBe('A')
		})
	})
}
