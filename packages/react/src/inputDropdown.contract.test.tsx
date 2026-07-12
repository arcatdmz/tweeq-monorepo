// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputDropdownContractProps,
	type KeyAction,
	type RendererHarness,
	runInputDropdownContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'
import {vi} from 'vitest'

import {InputDropdown} from './components/InputDropdown'

vi.mock('@iconify/react', () => ({
	Icon: () => null,
	addIcon: () => undefined,
	getIcon: () => undefined,
	iconLoaded: () => true,
	loadIcon: async () => undefined,
}))

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true
HTMLElement.prototype.scrollIntoView ??= () => undefined

runInputDropdownContract(async (component, initialProps) => {
	if (component !== 'InputDropdown') throw new Error(`Unsupported: ${component}`)
	const viewport = document.createElement('div')
	viewport.className = 'TqViewport'
	document.body.append(viewport)
	const root = createRoot(viewport)
	let props = {...initialProps}
	let value = initialProps.value
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			root.render(
				<InputDropdown
					{...props}
					value={value}
					onChange={next => {
						value = next
						captured.push({name: 'change', payload: [next]})
					}}
					onConfirm={() => captured.push({name: 'confirm', payload: []})}
				/>
			)
		})
	}

	await render()

	const harness: RendererHarness<InputDropdownContractProps> = {
		async update(next) {
			props = {...props, ...next}
			if (next.value !== undefined) value = next.value
			await render()
		},
		part: name => document.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key(action: KeyAction, part) {
			const partName = part ?? 'input'
			const initial = harness.part(partName) as HTMLElement | null
			if (!initial) throw new Error(`Missing part: ${partName}`)
			await act(async () => initial.focus())
			await render()
			const target = harness.part(partName)
			if (!target) throw new Error(`Missing part after focus: ${partName}`)
			await act(async () =>
				target.dispatchEvent(new KeyboardEvent(`key${action.type}`, {...action, bubbles: true}))
			)
			await render()
		},
		async activate(part) {
			const target = harness.part(part ?? 'root') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			await act(async () => target.click())
			await render()
		},
		value: () => value,
		events: () => captured,
		unmount() {
			act(() => root.unmount())
			viewport.remove()
		},
	}

	return harness
})
