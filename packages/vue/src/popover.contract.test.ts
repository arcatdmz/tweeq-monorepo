// @vitest-environment jsdom

import {
	type HarnessEvent,
	type PopoverContractProps,
	type RendererHarness,
	runPopoverContract,
} from '@tweeq/test-contracts'
import {createApp, defineComponent, h, nextTick, reactive} from 'vue'

import {Popover} from './Popover'

runPopoverContract(async (component, initialProps) => {
	if (component !== 'Popover') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	const reference = document.createElement('button')
	document.body.append(reference, container)
	const props = reactive({...initialProps})
	const captured: HarnessEvent[] = []
	const originalToggle = HTMLElement.prototype.togglePopover
	HTMLElement.prototype.togglePopover = () => false
	const app = createApp(
		defineComponent(() => () =>
			h(
				Popover,
				{
					...props,
					reference,
					onClose: () => captured.push({name: 'close', payload: []}),
					'onUpdate:open': (open: boolean) =>
						captured.push({name: 'changeOpen', payload: [open]}),
				},
				{default: () => h('i', {'data-tq-part': 'content'})}
			)
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<PopoverContractProps> = {
		async update(next) {
			Object.assign(props, next)
			await nextTick()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key() {},
		async activate(part) {
			const target = harness.part(part ?? 'root')
			if (!target) throw new Error(`Missing part: ${part ?? 'root'}`)
			target.dispatchEvent(
				Object.assign(new Event('toggle'), {newState: 'closed', oldState: 'open'})
			)
			await nextTick()
		},
		value: () => props.open,
		events: () => captured,
		unmount() {
			app.unmount()
			HTMLElement.prototype.togglePopover = originalToggle
			reference.remove()
			container.remove()
		},
	}
	return harness
})
