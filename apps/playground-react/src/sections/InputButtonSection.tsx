import {InputButton} from '@tweeq/react'
import {useState} from 'react'

export default function InputButtonSection() {
	const [count, setCount] = useState(0)

	return (
		<section data-testid="InputButton">
			<h2>InputButton</h2>
			<InputButton
				icon="char:+"
				label="Run action"
				tooltip="Run the demo action"
				onClick={() => setCount(value => value + 1)}
			/>
			<output data-testid="button-count">{count}</output>
		</section>
	)
}
