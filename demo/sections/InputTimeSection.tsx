import {useState} from 'react'

import {InputTime} from '../../src/react'

export default function InputTimeSection() {
	const [value, setValue] = useState(24)

	return (
		<section data-testid="InputTime">
			<h2>InputTime</h2>
			<InputTime value={value} frameRate={24} onChange={setValue} />
			<output data-testid="time-value">{value}</output>
		</section>
	)
}
