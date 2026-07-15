import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface InputNumberContractProps {
	value: number
	step?: number
	disabled?: boolean
}

export function runInputNumberContract(
	createHarness: RendererHarnessFactory<InputNumberContractProps>
) {
	describe('InputNumber renderer contract', () => {
		let harness: RendererHarness<InputNumberContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('follows controlled value updates', async () => {
			harness = await createHarness('InputNumber', {value: 2})
			expect((harness.part('input') as HTMLInputElement).value).toBe('2')

			await harness.update({value: 4})
			expect((harness.part('input') as HTMLInputElement).value).toBe('4')
		})

		it('reports numeric text input', async () => {
			harness = await createHarness('InputNumber', {value: 2})
			await enterText(harness, '4')
			expect(harness.value()).toBe(4)
			expect(harness.events()).toContainEqual({name: 'change', payload: [4]})
		})

		it('uses the shared expression compiler', async () => {
			harness = await createHarness('InputNumber', {value: 3})
			await harness.key({type: 'down', key: '=', metaKey: true}, 'input')
			await enterText(harness, 'x * 2')
			expect(harness.value()).toBe(6)
			expect(harness.events()).toContainEqual({name: 'change', payload: [6]})
		})

		it('applies the configured keyboard step', async () => {
			harness = await createHarness('InputNumber', {value: 4, step: 2})
			await harness.key({type: 'down', key: 'ArrowUp'}, 'input')
			expect(harness.value()).toBe(6)
		})

		it('forwards disabled state and stable parts', async () => {
			harness = await createHarness('InputNumber', {value: 0, disabled: true})
			const root = harness.part('root') as HTMLElement
			expect(root.hasAttribute('data-tq-input-number')).toBe(true)
			expect(harness.part('number-display')).not.toBeNull()
			expect(harness.part('number-bar')).not.toBeNull()
			expect(harness.part('scrub-grip')).not.toBeNull()
			expect((harness.part('input') as HTMLInputElement).disabled).toBe(true)
		})
	})
}

async function enterText(
	harness: RendererHarness<InputNumberContractProps>,
	value: string
) {
	if (!harness.text) throw new Error('Renderer harness does not support text input')
	await harness.text(value, 'input')
}
