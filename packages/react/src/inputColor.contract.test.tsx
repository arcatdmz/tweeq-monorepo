// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputColorContractProps,
	type RendererHarness,
	runInputColorContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'

import {InputColor, InputColorPicker} from './components/InputColor'

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

runInputColorContract(async (component, initialProps) => {
	Object.assign(window, {
		EyeDropper: class {
			async open() {
				return {sRGBHex: '#336699'}
			}
		},
	})
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	let value = initialProps.value
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			const shared = {
				...props,
				value,
				pickers: [],
				presets: [],
				onChange(next: string) {
					value = next
					captured.push({name: 'change', payload: [next]})
				},
				onConfirm: () => captured.push({name: 'confirm', payload: []}),
			}
			root.render(
				component === 'InputColor' ? (
					<InputColor {...shared} />
				) : component === 'InputColorPicker' ? (
					<InputColorPicker {...shared} />
				) : (
					throwUnsupported(component)
				)
			)
		})
	}
	await render()

	const harness: RendererHarness<InputColorContractProps> = {
		async update(next) {
			props = {...props, ...next}
			if (next.value !== undefined) value = next.value
			await render()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key() {},
		async activate(part = 'root') {
			await act(async () => {
				;(harness.part(part) as HTMLElement | null)?.click()
				await Promise.resolve()
			})
			await render()
		},
		value: () => value,
		events: () => captured,
		unmount() {
			act(() => root.unmount())
			container.remove()
			delete (window as unknown as {EyeDropper?: unknown}).EyeDropper
		},
	}
	return harness
})

function throwUnsupported(component: string): never {
	throw new Error(`Unsupported: ${component}`)
}
