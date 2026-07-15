// @vitest-environment jsdom

import {
	type InputGroupContractProps,
	type RendererHarness,
	runInputGroupContract,
} from '@tweeq/test-contracts'
import {createApp, defineComponent, Fragment, h, nextTick, reactive} from 'vue'

import {InputGroup} from './InputGroup'

const Item = defineComponent({
	props: {
		index: {type: Number, required: true},
		inlinePosition: String,
		blockPosition: String,
	},
	setup: props => () =>
		h('div', {
			'data-tq-part': `item-${props.index}`,
			'inline-position': props.inlinePosition,
			'block-position': props.blockPosition,
		}),
})

runInputGroupContract(async (component, initialProps) => {
	if (component !== 'InputGroup') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const props = reactive({...initialProps})
	const app = createApp(
		defineComponent(() => () =>
			h(InputGroup, {direction: props.direction}, {
				default: () => [
					' ',
					h(Fragment, null, Array.from({length: props.count}, (_, index) =>
						h(Item, {key: index, index})
					)),
				],
			})
		)
	)
	app.mount(container)
	await nextTick()

	const harness: RendererHarness<InputGroupContractProps> = {
		async update(next) {
			Object.assign(props, next)
			await nextTick()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key() {},
		async activate() {},
		value: () => undefined,
		events: () => [],
		unmount() {
			app.unmount()
			container.remove()
		},
	}

	return harness
})
