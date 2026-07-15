// @vitest-environment jsdom

import {
	type KeyAction,
	type PaneSplitContractProps,
	type PointerAction,
	type RendererHarness,
	runPaneSplitContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'

import {PaneSplit} from './components/PaneSplit'

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

let harnessId = 0
runPaneSplitContract(async (_component, initialProps) => {
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	const name = `contract-split-${++harnessId}`

	async function render() {
		await act(async () => {
			root.render(
				<PaneSplit
					{...props}
					name={name}
					first={<span>First</span>}
					second={<span>Second</span>}
				/>
			)
		})
	}
	await render()

	const harness: RendererHarness<PaneSplitContractProps> = {
		async update(next) {
			props = {...props, ...next}
			await render()
		},
		part: part => container.querySelector(`[data-tq-part="${part}"]`),
		async pointer(action: PointerAction, part = 'divider') {
			installGeometry(harness)
			await act(async () => {
				harness.part(part)?.dispatchEvent(pointerEvent(action))
			})
			await render()
		},
		async key(action: KeyAction, part = 'divider') {
			installGeometry(harness)
			const target = harness.part(part)
			if (!target) throw new Error(`Missing part: ${part}`)
			const names =
				action.type === 'press' ? ['keydown', 'keyup'] : [`key${action.type}`]
			await act(async () => {
				for (const name of names) {
					target.dispatchEvent(
						new KeyboardEvent(name, {...action, bubbles: true})
					)
				}
			})
			await render()
		},
		async activate() {},
		value: () => {
			const pane = harness.part(props.fixed ?? 'first') as HTMLElement
			return props.direction === 'horizontal' ? pane.style.width : pane.style.height
		},
		events: () => [],
		unmount() {
			act(() => root.unmount())
			container.remove()
		},
	}
	return harness
})

function installGeometry(harness: RendererHarness) {
	for (const part of ['root', 'divider']) {
		const element = harness.part(part) as HTMLElement
		Object.assign(element, {
			getBoundingClientRect: () => ({
				left: part === 'divider' ? 250 : 0,
				top: 0,
				right: part === 'divider' ? 251 : 500,
				bottom: 200,
				width: part === 'divider' ? 1 : 500,
				height: 200,
			}),
			setPointerCapture: () => undefined,
			releasePointerCapture: () => undefined,
		})
	}
}

function pointerEvent(action: PointerAction) {
	const type =
		action.type === 'down'
			? 'pointerdown'
			: action.type === 'move'
				? 'pointermove'
				: 'pointerup'
	return Object.assign(new Event(type, {bubbles: true}), {
		button: 0,
		isPrimary: true,
		pointerType: 'mouse',
		pointerId: 1,
		clientX: action.x,
		clientY: action.y,
	})
}
