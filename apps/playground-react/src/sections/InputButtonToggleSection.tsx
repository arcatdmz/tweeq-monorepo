import {InputButtonToggle} from '@tweeq/react'
import {useState} from 'react'

export default function InputButtonToggleSection() {
	const [value, setValue] = useState(false)

	return (
		<section data-testid="InputButtonToggle">
			<h2>InputButtonToggle</h2>
			<InputButtonToggle
				value={value}
				label="Toggle button"
				onChange={setValue}
			/>
			<output data-testid="button-toggle-value">{String(value)}</output>
		</section>
	)
}
