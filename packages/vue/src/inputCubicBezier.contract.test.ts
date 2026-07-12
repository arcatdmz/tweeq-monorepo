// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputCubicBezierContractProps,
	type PointerAction,
	type RendererHarness,
	runInputCubicBezierContract,
} from '@tweeq/test-contracts'
import {createApp, defineComponent, h, nextTick, reactive, ref} from 'vue'

import {InputCubicBezier, InputCubicBezierPicker} from './InputCubicBezier'

runInputCubicBezierContract(async (component, initialProps) => {
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const value = ref(initialProps.value)
	const captured: HarnessEvent[] = []
	const Component =
		component === 'InputCubicBezier'
			? InputCubicBezier
			: component === 'InputCubicBezierPicker'
				? InputCubicBezierPicker
				: throwUnsupported(component)
	const app = createApp(
		defineComponent(() => () =>
			h(Component, {
				...props,
				modelValue: value.value,
				'onUpdate:modelValue'(next: typeof value.value) {
					value.value = next
					captured.push({name: 'change', payload: [[...next]]})
				},
				onConfirm: () => captured.push({name: 'confirm', payload: []}),
			})
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<InputCubicBezierContractProps> = {
		async update(next) {
			Object.assign(props, next)
			if (next.value !== undefined) value.value = next.value
			await nextTick()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer(action: PointerAction, part) {
			const target = harness.part(part ?? 'pad') as HTMLElement | SVGElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'pad'}`)
			const pad = harness.part('pad') as SVGElement | null
			if (pad) {
				Object.assign(pad, {
					getBoundingClientRect: () => ({
						left: 0,
						top: 0,
						right: 100,
						bottom: 100,
						width: 100,
						height: 100,
					}),
					setPointerCapture: () => undefined,
					releasePointerCapture: () => undefined,
				})
			}
			target.dispatchEvent(pointerEvent(action))
			await nextTick()
		},
		async key() {},
		async activate() {},
		value: () => value.value,
		events: () => captured,
		unmount() {
			app.unmount()
			container.remove()
		},
	}
	return harness
})

function pointerEvent(action: PointerAction) {
	const name = action.type === 'down' ? 'pointerdown' : action.type === 'move' ? 'pointermove' : 'pointerup'
	return Object.assign(new Event(name, {bubbles: true}), {
		button: 0,
		isPrimary: true,
		pointerType: 'touch',
		pointerId: 1,
		clientX: action.x,
		clientY: action.y,
	})
}

function throwUnsupported(component: string): never {
	throw new Error(`Unsupported: ${component}`)
}
