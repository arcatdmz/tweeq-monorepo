// @vitest-environment jsdom

import {
	type HarnessEvent,
	type PointerAction,
	type RendererHarness,
	runTimelineContract,
	type TimelineContractProps,
} from '@tweeq/test-contracts'
import {createApp, defineComponent, h, nextTick, reactive, ref} from 'vue'

import {Timeline} from './Timeline'

runTimelineContract(async (component, initialProps) => {
	if (component !== 'Timeline') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const frameWidth = ref(initialProps.frameWidth ?? 60)
	const captured: HarnessEvent[] = []
	const app = createApp(
		defineComponent(() => () =>
			h(
				Timeline,
				{
					...props,
					frameWidth: frameWidth.value,
					'onUpdate:frameWidth'(next: number) {
						frameWidth.value = next
						captured.push({name: 'changeFrameWidth', payload: [next]})
					},
				},
				{
					default: () => h('i', {'data-tq-part': 'content-probe'}),
					scrollbarRight: () =>
						h('i', {'data-tq-part': 'scrollbar-probe'}),
				}
			)
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<TimelineContractProps> = {
		async update(next) {
			Object.assign(props, next)
			if (next.frameWidth !== undefined) frameWidth.value = next.frameWidth
			await nextTick()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer(action: PointerAction, part) {
			const target = harness.part(part ?? 'fixed')
			if (!target) throw new Error(`Missing part: ${part ?? 'fixed'}`)
			target.dispatchEvent(
				new WheelEvent('wheel', {
					bubbles: true,
					cancelable: true,
					deltaY: action.deltaY,
					altKey: action.altKey,
					clientX: action.x,
				})
			)
			await nextTick()
		},
		async key() {},
		async activate() {},
		value: () => frameWidth.value,
		events: () => captured,
		unmount() {
			app.unmount()
			container.remove()
		},
	}
	return harness
})
