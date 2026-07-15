import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface InputStringContractProps {
	value: string
	disabled?: boolean
}

export function runInputStringContract(
	createHarness: RendererHarnessFactory<InputStringContractProps>
) {
	describe('InputString renderer contract', () => {
		let harness: RendererHarness<InputStringContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('follows controlled value updates', async () => {
			harness = await createHarness('InputString', {value: 'first'})
			expect((harness.part('input') as HTMLInputElement).value).toBe('first')

			await harness.update({value: 'second'})
			expect((harness.part('input') as HTMLInputElement).value).toBe('second')
		})

		it('reports native text input', async () => {
			harness = await createHarness('InputString', {value: 'first'})

			await enterText(harness, 'next')

			expect(harness.value()).toBe('next')
			expect(harness.events()).toContainEqual({name: 'change', payload: ['next']})
		})

		it('uses the shared expression compiler', async () => {
			harness = await createHarness('InputString', {value: 'a'})

			await harness.key({type: 'down', key: '=', metaKey: true}, 'input')
			await enterText(harness, 'x + i')

			// A standalone field is not in a multi-selection, whose index is -1.
			expect(harness.value()).toBe('a-1')
			expect(harness.events()).toContainEqual({name: 'change', payload: ['a-1']})
		})

		it('forwards disabled state and stable parts', async () => {
			harness = await createHarness('InputString', {value: '', disabled: true})

			expect(harness.part('root')).not.toBeNull()
			expect((harness.part('input') as HTMLInputElement).disabled).toBe(true)
		})
	})
}

async function enterText(
	harness: RendererHarness<InputStringContractProps>,
	value: string
) {
	if (!harness.text) throw new Error('Renderer harness does not support text input')
	await harness.text(value, 'input')
}
