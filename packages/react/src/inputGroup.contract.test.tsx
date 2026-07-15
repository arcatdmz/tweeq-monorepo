// @vitest-environment jsdom

import {
	type InputGroupContractProps,
	type RendererHarness,
	runInputGroupContract,
} from '@tweeq/test-contracts'
import {act, Fragment, type ReactNode} from 'react'
import {createRoot} from 'react-dom/client'

import {InputGroup} from './components/InputGroup'

;(globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean})
	.IS_REACT_ACT_ENVIRONMENT = true

function Item({
	index,
	inlinePosition,
	blockPosition,
}: {
	index: number
	inlinePosition?: string
	blockPosition?: string
}) {
	return (
		<div
			data-tq-part={`item-${index}`}
			inline-position={inlinePosition}
			block-position={blockPosition}
		/>
	)
}

runInputGroupContract(async (component, initialProps) => {
	if (component !== 'InputGroup') throw new Error(`Unsupported: ${component}`)
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	let props = {...initialProps}

	async function render() {
		const items: ReactNode[] = Array.from({length: props.count}, (_, index) => (
			<Item key={index} index={index} />
		))
		await act(async () => {
			root.render(
				<InputGroup direction={props.direction}>
					{' '}
					<Fragment>{items}</Fragment>
				</InputGroup>
			)
		})
	}

	await render()

	const harness: RendererHarness<InputGroupContractProps> = {
		async update(next) {
			props = {...props, ...next}
			await render()
		},
		part: name => container.querySelector(`[data-tq-part="${name}"]`),
		async pointer() {},
		async key() {},
		async activate() {},
		value: () => undefined,
		events: () => [],
		unmount() {
			act(() => root.unmount())
			container.remove()
		},
	}

	return harness
})
