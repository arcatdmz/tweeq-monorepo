// @vitest-environment jsdom

import {
	type HarnessEvent,
	type IconIndicatorContractProps,
	type KeyAction,
	type RendererHarness,
	runIconIndicatorContract,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'

import {IconIndicator} from './components/IconIndicator'

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

runIconIndicatorContract(async (component, initialProps) => {
	if (component !== 'IconIndicator') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	let active = initialProps.active
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			root.render(
				<IconIndicator
					{...props}
					active={active}
					onChangeActive={next => {
						active = next
						captured.push({name: 'change', payload: [next]})
					}}
				/>
			)
		})
	}

	await render()

	const harness: RendererHarness<IconIndicatorContractProps> = {
		async update(next) {
			props = {...props, ...next}
			if (next.active !== undefined) active = next.active
			await render()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key(action: KeyAction, part) {
			const target = harness.part(part ?? 'root')
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			const names = action.type === 'press' ? ['keydown', 'keyup'] : [`key${action.type}`]
			await act(async () => {
				for (const name of names) {
					target.dispatchEvent(new KeyboardEvent(name, {...action, bubbles: true}))
				}
			})
			await render()
		},
		async activate(part) {
			const target = harness.part(part ?? 'root') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			await act(async () => target.click())
			await render()
		},
		value: () => active,
		events: () => captured,
		unmount() {
			act(() => root.unmount())
			container.remove()
		},
	}

	return harness
})
