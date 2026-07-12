// @vitest-environment jsdom

import {
	type HarnessEvent,
	type PointerAction,
	type RendererHarness,
	runTimelineContract,
	type TimelineContractProps,
} from '@tweeq/test-contracts'
import {act} from 'react'
import {createRoot} from 'react-dom/client'

import {Timeline} from './components/Timeline'

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

runTimelineContract(async (component, initialProps) => {
	if (component !== 'Timeline') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}
	let frameWidth = initialProps.frameWidth ?? 60
	const captured: HarnessEvent[] = []

	async function render() {
		await act(async () => {
			root.render(
				<Timeline
					{...props}
					frameWidth={frameWidth}
					onChangeFrameWidth={next => {
						frameWidth = next
						captured.push({name: 'changeFrameWidth', payload: [next]})
					}}
					renderScrollbarRight={() => <i data-tq-part="scrollbar-probe" />}
				>
					{() => <i data-tq-part="content-probe" />}
				</Timeline>
			)
		})
	}

	await render()
	const harness: RendererHarness<TimelineContractProps> = {
		async update(next) {
			props = {...props, ...next}
			if (next.frameWidth !== undefined) frameWidth = next.frameWidth
			await render()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer(action: PointerAction, part) {
			const target = harness.part(part ?? 'fixed')
			if (!target) throw new Error(`Missing part: ${part ?? 'fixed'}`)
			await act(async () =>
				target.dispatchEvent(
					new WheelEvent('wheel', {
						bubbles: true,
						cancelable: true,
						deltaY: action.deltaY,
						altKey: action.altKey,
						clientX: action.x,
					})
				)
			)
			await render()
		},
		async key() {},
		async activate() {},
		value: () => frameWidth,
		events: () => captured,
		unmount() {
			act(() => root.unmount())
			container.remove()
		},
	}
	return harness
})
