// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputTranslateContractProps,
	type PointerAction,
	type RendererHarness,
	runInputTranslateContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'
import {vi} from 'vitest'

import {InputTranslate} from './components/InputTranslate'

vi.mock('@iconify/react', () => ({
	Icon: (props: Record<string, unknown>) => <i {...props} />,
	addIcon: () => undefined,
	getIcon: () => undefined,
	iconLoaded: () => true,
	loadIcon: async () => undefined,
}))

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

runInputTranslateContract(async (component, initialProps) => {
	if (component !== 'InputTranslate') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	let value = initialProps.value
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			root.render(
				<InputTranslate
					{...props}
					value={value}
					onChange={next => {
						value = [...next]
						captured.push({name: 'change', payload: [[...next]]})
					}}
					onFocus={() => captured.push({name: 'focus', payload: []})}
					onConfirm={() => captured.push({name: 'confirm', payload: []})}
					onBlur={() => captured.push({name: 'blur', payload: []})}
				/>
			)
		})
	}

	await render()

	const harness: RendererHarness<InputTranslateContractProps> = {
		async update(next) {
			props = {...props, ...next}
			if (next.value !== undefined) value = next.value
			await render()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer(action: PointerAction, part) {
			const target = harness.part(part ?? 'root') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			installPointerCapture(target)
			await act(async () => target.dispatchEvent(pointerEvent(action)))
			await render()
		},
		async key() {},
		async activate() {},
		value: () => value,
		events: () => captured,
		unmount() {
			act(() => root.unmount())
			container.remove()
		},
	}

	return harness
})

function installPointerCapture(target: HTMLElement) {
	Object.assign(target, {
		setPointerCapture: () => undefined,
		releasePointerCapture: () => undefined,
	})
}

function pointerEvent(action: PointerAction) {
	const name = action.type === 'down' ? 'pointerdown' : action.type === 'move' ? 'pointermove' : 'pointerup'
	return Object.assign(new Event(name, {bubbles: true}), {
		button: action.button ?? 0,
		isPrimary: true,
		pointerType: 'mouse',
		pointerId: 1,
		clientX: action.x,
		clientY: action.y,
	})
}
