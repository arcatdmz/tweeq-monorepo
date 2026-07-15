// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputTranslateContractProps,
	type PointerAction,
	type RendererHarness,
	runInputTranslateContract,
} from '@tweeq/test-contracts'
import {vi} from 'vitest'
import {createApp, defineComponent, h, nextTick, reactive, ref} from 'vue'

import {InputTranslate} from './InputTranslate'

vi.mock('@iconify/vue', () => ({
	Icon: {
		inheritAttrs: false,
		render(this: {$attrs: Record<string, unknown>}) {
			return h('i', this.$attrs)
		},
	},
	addIcon: () => undefined,
	getIcon: () => undefined,
	iconLoaded: () => true,
	loadIcon: async () => undefined,
}))

runInputTranslateContract(async (component, initialProps) => {
	if (component !== 'InputTranslate') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const value = ref(initialProps.value)
	const captured: HarnessEvent[] = []
	const app = createApp(
		defineComponent(() => () =>
			h(InputTranslate, {
				...props,
				modelValue: value.value,
				'onUpdate:modelValue'(next: [number, number]) {
					value.value = [...next]
					captured.push({name: 'change', payload: [[...next]]})
				},
				onFocus: () => captured.push({name: 'focus', payload: []}),
				onConfirm: () => captured.push({name: 'confirm', payload: []}),
				onBlur: () => captured.push({name: 'blur', payload: []}),
			})
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<InputTranslateContractProps> = {
		async update(next) {
			Object.assign(props, next)
			if (next.value !== undefined) value.value = next.value
			await nextTick()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer(action: PointerAction, part) {
			const target = harness.part(part ?? 'root') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			Object.assign(target, {
				setPointerCapture: () => undefined,
				releasePointerCapture: () => undefined,
			})
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
		button: action.button ?? 0,
		isPrimary: true,
		pointerType: 'mouse',
		pointerId: 1,
		clientX: action.x,
		clientY: action.y,
	})
}
