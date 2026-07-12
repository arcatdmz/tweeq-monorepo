// @vitest-environment jsdom

import {
	type HarnessEvent,
	type InputDropdownContractProps,
	type KeyAction,
	type RendererHarness,
	runInputDropdownContract,
} from '@tweeq/test-contracts'
import {vi} from 'vitest'
import {createApp, defineComponent, h, nextTick, reactive, ref} from 'vue'

import {InputDropdown} from './InputDropdown'

vi.mock('@iconify/vue', () => ({
	Icon: {render: () => null},
	addIcon: () => undefined,
	getIcon: () => undefined,
	iconLoaded: () => true,
	loadIcon: async () => undefined,
}))

HTMLElement.prototype.scrollIntoView ??= () => undefined
HTMLElement.prototype.togglePopover ??= () => undefined

runInputDropdownContract(async (component, initialProps) => {
	if (component !== 'InputDropdown') throw new Error(`Unsupported: ${component}`)
	const viewport = document.createElement('div')
	viewport.className = 'TqViewport'
	document.body.append(viewport)
	const props = reactive({...initialProps})
	const value = ref(initialProps.value)
	const captured: HarnessEvent[] = []
	const app = createApp(
		defineComponent(() => () =>
			h(InputDropdown, {
				...props,
				modelValue: value.value,
				'onUpdate:modelValue'(next: string) {
					value.value = next
					captured.push({name: 'change', payload: [next]})
				},
				onConfirm: () => captured.push({name: 'confirm', payload: []}),
			})
		)
	)
	app.mount(viewport)
	await nextTick()

	const harness: RendererHarness<InputDropdownContractProps> = {
		async update(next) {
			Object.assign(props, next)
			if (next.value !== undefined) value.value = next.value
			await nextTick()
		},
		part: name => document.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key(action: KeyAction, part) {
			const partName = part ?? 'input'
			const initial = harness.part(partName) as HTMLElement | null
			if (!initial) throw new Error(`Missing part: ${partName}`)
			initial.focus()
			await nextTick()
			const target = harness.part(partName)
			if (!target) throw new Error(`Missing part after focus: ${partName}`)
			target.dispatchEvent(new KeyboardEvent(`key${action.type}`, {...action, bubbles: true}))
			await nextTick()
		},
		async activate(part) {
			const target = harness.part(part ?? 'root') as HTMLElement | null
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			target.click()
			await nextTick()
		},
		value: () => value.value,
		events: () => captured,
		unmount() {
			app.unmount()
			viewport.remove()
		},
	}

	return harness
})
