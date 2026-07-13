import {useTweeqRuntime} from '@tweeq/react'
import {useEffect, useState} from 'react'

export default function CommandPaletteSection() {
	const {actionsStore} = useTweeqRuntime()
	const [count, setCount] = useState(0)

	useEffect(
		() =>
			actionsStore.getState().register([
				{
					id: 'demo.increment',
					label: 'Increment demo counter',
					icon: 'material-symbols:add-rounded',
					perform: () => setCount(current => current + 1),
				},
			]),
		[actionsStore]
	)

	return (
		<section data-testid="CommandPalette">
			<h2>CommandPalette</h2>
			<p>Press Command/Ctrl+P and run “Increment demo counter”.</p>
			<output data-testid="palette-value">{count}</output>
		</section>
	)
}
