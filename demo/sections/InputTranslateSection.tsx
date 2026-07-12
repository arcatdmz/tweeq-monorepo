import {type vec2} from 'linearly'
import {useState} from 'react'

import {InputTranslate} from '../../src/react'

export default function InputTranslateSection() {
	const [value, setValue] = useState<vec2>([0, 0])

	return (
		<section data-testid="InputTranslate">
			<h2>InputTranslate</h2>
			<InputTranslate value={value} min={-100} max={100} onChange={setValue} />
			<output data-testid="translate-value">{JSON.stringify(value)}</output>
		</section>
	)
}
