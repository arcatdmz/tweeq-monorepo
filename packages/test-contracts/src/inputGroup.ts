import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface InputGroupContractProps {
	direction?: 'horizontal' | 'vertical'
	count: number
}

/** Run InputGroup's renderer-neutral child-position contract. */
export function runInputGroupContract(
	createHarness: RendererHarnessFactory<InputGroupContractProps>
) {
	describe('InputGroup renderer contract', () => {
		let harness: RendererHarness<InputGroupContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('assigns inline positions through fragments and whitespace', async () => {
			harness = await createHarness('InputGroup', {
				direction: 'horizontal',
				count: 3,
			})

			expect(harness.part('root')?.getAttribute('data-direction')).toBe('horizontal')
			expect(harness.part('root')?.getAttribute('data-tq-component')).toBe(
				'input-group'
			)
			expect(harness.part('root')?.getAttribute('data-tq-layout')).toBe(
				'input-group'
			)
			expect(position(harness, 0, 'inline')).toBe('start')
			expect(position(harness, 1, 'inline')).toBe('middle')
			expect(position(harness, 2, 'inline')).toBe('end')
		})

		it('assigns block positions for vertical groups', async () => {
			harness = await createHarness('InputGroup', {
				direction: 'vertical',
				count: 3,
			})

			expect(position(harness, 0, 'block')).toBe('start')
			expect(position(harness, 1, 'block')).toBe('middle')
			expect(position(harness, 2, 'block')).toBe('end')
		})

		it('does not stamp a position onto a single child', async () => {
			harness = await createHarness('InputGroup', {count: 1})

			expect(position(harness, 0, 'inline')).toBeNull()
			expect(position(harness, 0, 'block')).toBeNull()
		})
	})
}

function position(
	harness: RendererHarness<InputGroupContractProps>,
	index: number,
	axis: 'inline' | 'block'
) {
	return harness.part(`item-${index}`)?.getAttribute(`${axis}-position`) ?? null
}
