import {useState} from 'react'

import {InputButtonToggle} from '../../src/react'

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
