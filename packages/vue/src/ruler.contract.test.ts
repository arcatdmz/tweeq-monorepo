// @vitest-environment jsdom

import {
	type HarnessEvent,
	type RendererHarness,
	type RulerContractProps,
	runRulerContract,
} from '@tweeq/test-contracts'
import {createApp, defineComponent, h, nextTick, reactive} from 'vue'

import {Ruler} from './Ruler'

runRulerContract(async (component, initialProps) => {
	if (component !== 'Ruler') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const captured: HarnessEvent[] = []
	const app = createApp(
		defineComponent(() => () =>
			h(Ruler, props, {default: () => h('i', {'data-tq-part': 'content-probe'})})
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<RulerContractProps> = {
		async update(next) {
			Object.assign(props, next)
			await nextTick()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key() {},
		async activate() {},
		value: () => undefined,
		events: () => captured,
		unmount() {
			app.unmount()
			container.remove()
		},
	}
	return harness
})
