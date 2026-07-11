import {type vec2} from 'linearly'
import {useState} from 'react'

import {InputPosition} from '../../src/react'

export default function InputPositionSection() {
	const [value, setValue] = useState<vec2>([10, 20])

	return (
		<section data-testid="InputPosition">
			<h2>InputPosition</h2>
			<InputPosition value={value} onChange={setValue} />
			<output data-testid="position-value">{JSON.stringify(value)}</output>
		</section>
	)
}
