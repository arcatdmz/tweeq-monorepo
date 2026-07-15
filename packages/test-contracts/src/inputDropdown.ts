import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface InputDropdownContractProps {
	value: string
	options: string[]
	labels?: string[]
}

export function runInputDropdownContract(
	createHarness: RendererHarnessFactory<InputDropdownContractProps>
) {
	describe('InputDropdown renderer contract', () => {
		let harness: RendererHarness<InputDropdownContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('renders labels and follows controlled updates', async () => {
			harness = await create('b')
			expect((harness.part('input') as HTMLInputElement).value).toBe('Beta')

			await harness.update({value: 'c'})
			expect((harness.part('input') as HTMLInputElement).value).toBe('Gamma')
		})

		it('wraps keyboard navigation and preserves value for empty options', async () => {
			harness = await create('c')
			await harness.key({type: 'down', key: 'ArrowDown'}, 'input')
			expect(harness.value()).toBe('a')

			await harness.update({options: [], labels: []})
			expect(harness.value()).toBe('a')
			await harness.key({type: 'down', key: 'ArrowDown'}, 'input')
			expect(harness.value()).toBe('a')
		})

		it('opens an accessible listbox and confirms an option click', async () => {
			harness = await create('a')
			await harness.key({type: 'down', key: 'ArrowDown'}, 'input')

			expect(harness.part('listbox')?.getAttribute('role')).toBe('listbox')
			expect(harness.part('option-1')?.getAttribute('aria-selected')).toBe('true')
			await harness.activate('option-2')
			expect(harness.value()).toBe('c')
			expect(harness.events()).toContainEqual({name: 'confirm', payload: []})
		})

		it('rolls keyboard navigation back on Escape', async () => {
			harness = await create('b')
			await harness.key({type: 'down', key: 'ArrowDown'}, 'input')
			expect(harness.value()).toBe('c')
			await harness.key({type: 'down', key: 'Escape'}, 'input')
			expect(harness.value()).toBe('b')
		})

		async function create(value: string) {
			return createHarness('InputDropdown', {
				value,
				options: ['a', 'b', 'c'],
				labels: ['Alpha', 'Beta', 'Gamma'],
			})
		}
	})
}
