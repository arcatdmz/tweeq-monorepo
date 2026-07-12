// @vitest-environment jsdom

import {
	type HarnessEvent,
	type PopoverContractProps,
	type RendererHarness,
	runPopoverContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'

import {Popover} from './components/Popover'

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

runPopoverContract(async (component, initialProps) => {
	if (component !== 'Popover') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	const reference = document.createElement('button')
	document.body.append(reference, container)
	const root = createRoot(container)
	let props = {...initialProps}
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			root.render(
				<Popover
					{...props}
					reference={reference}
					onClose={() => captured.push({name: 'close', payload: []})}
					onChangeOpen={open =>
						captured.push({name: 'changeOpen', payload: [open]})
					}
				>
					<i data-tq-part="content" />
				</Popover>
			)
		})
	}
	await render()

	const harness: RendererHarness<PopoverContractProps> = {
		async update(next) {
			props = {...props, ...next}
			await render()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key() {},
		async activate(part) {
			const target = harness.part(part ?? 'root')
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			await act(async () =>
				target.dispatchEvent(
					Object.assign(new Event('toggle'), {newState: 'closed', oldState: 'open'})
				)
			)
		},
		value: () => props.open,
		events: () => captured,
		unmount() {
			act(() => root.unmount())
			reference.remove()
			container.remove()
		},
	}
	return harness
})
