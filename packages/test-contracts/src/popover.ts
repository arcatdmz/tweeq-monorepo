import {afterEach, describe, expect, it} from 'vitest'

import type {RendererHarness, RendererHarnessFactory} from './harness'

export interface PopoverContractProps {
	open: boolean
	placement?: 'bottom-start' | [number, number]
	lightDismiss?: boolean
}

export function runPopoverContract(
	createHarness: RendererHarnessFactory<PopoverContractProps>
) {
	describe('Popover renderer contract', () => {
		let harness: RendererHarness<PopoverContractProps> | undefined

		afterEach(() => {
			harness?.unmount()
			harness = undefined
		})

		it('renders controlled coordinate placement and native mode', async () => {
			harness = await createHarness('Popover', {
				open: true,
				placement: [12, 34],
				lightDismiss: false,
			})
			const root = harness.part('root') as HTMLElement
			expect(root.style.left).toBe('12px')
			expect(root.style.top).toBe('34px')
			expect(root.getAttribute('popover')).toBe('manual')
		})

		it('emits one close lifecycle from the native toggle event', async () => {
			harness = await createHarness('Popover', {open: true})
			await harness.activate('root')
			expect(harness.events()).toEqual([
				{name: 'close', payload: []},
				{name: 'changeOpen', payload: [false]},
			])
		})

		it('unmounts content when controlled closed', async () => {
			harness = await createHarness('Popover', {open: true})
			expect(harness.part('content')).not.toBeNull()
			await harness.update({open: false})
			expect(harness.part('root')).toBeNull()
		})
	})
}
