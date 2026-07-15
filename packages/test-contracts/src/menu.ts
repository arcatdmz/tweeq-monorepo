import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface MenuContractProps {
	items: MenuContractItem[]
}

export type MenuContractItem =
	| {
			kind: 'item'
			label: string
			shortLabel?: string
			disabled?: boolean
	  }
	| {kind: 'group'; label: string; children: MenuContractItem[]}
	| {kind: 'separator'}

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

		it('uses menu roles and roving enabled-item focus', async () => {
			harness = await createHarness('Menu', {
				items: [
					{kind: 'item', label: 'First'},
					{kind: 'separator'},
					{kind: 'item', label: 'Disabled', disabled: true},
					{kind: 'item', label: 'Last'},
				],
			})
			const root = harness.part('root') as HTMLElement
			expect(root.getAttribute('role')).toBe('menu')
			expect(root.querySelector('[data-tq-part="separator"]')?.getAttribute('role')).toBe(
				'separator'
			)
			const items = [...root.querySelectorAll<HTMLElement>('[role="menuitem"]')]
			expect(items.map(item => item.tabIndex)).toEqual([0, -1, -1])
			expect(items[1].getAttribute('aria-disabled')).toBe('true')

			items[0].focus()
			await harness.key({type: 'press', key: 'ArrowDown'}, 'focused')
			expect(document.activeElement).toBe(items[2])
			await harness.key({type: 'press', key: 'ArrowDown'}, 'focused')
			expect(document.activeElement).toBe(items[0])
			await harness.key({type: 'press', key: 'End'}, 'focused')
			expect(document.activeElement).toBe(items[2])
		})

		it('opens, returns from, activates, and escapes a submenu by key', async () => {
			harness = await createHarness('Menu', {
				items: [
					{
						kind: 'group',
						label: 'Group',
						children: [{kind: 'item', label: 'Nested'}],
					},
				],
			})
			const group = harness.part('item') as HTMLElement
			group.focus()
			await harness.key({type: 'press', key: 'ArrowRight'}, 'focused')
			expect(document.querySelectorAll('[role="menu"]')).toHaveLength(2)
			expect(document.activeElement?.textContent).toContain('Nested')

			await harness.key({type: 'press', key: 'ArrowLeft'}, 'focused')
			expect(document.querySelectorAll('[role="menu"]')).toHaveLength(1)
			expect(document.activeElement).toBe(group)

			await harness.key({type: 'press', key: 'ArrowRight'}, 'focused')
			await harness.key({type: 'press', key: 'Enter'}, 'focused')
			expect(harness.events()).toEqual([
				{name: 'perform', payload: ['Nested']},
				{name: 'close', payload: []},
			])

			await harness.key({type: 'press', key: 'Escape'}, 'item')
			expect(harness.events().at(-1)).toEqual({name: 'close', payload: []})
		})
	})
}
