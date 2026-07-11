import {useState} from 'react'

import {InputRotary} from '../../src/react'

export default function InputRotarySection() {
	const [value, setValue] = useState(45)

	return (
		<section data-testid="InputRotary">
			<h2>InputRotary</h2>
			<InputRotary value={value} onChange={setValue} />
			<output data-testid="rotary-value">{value}</output>
		</section>
	)
}
