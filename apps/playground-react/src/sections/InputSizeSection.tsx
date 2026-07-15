import {InputSize} from '@tweeq/react'
import {type vec2} from 'linearly'
import {useState} from 'react'

export default function InputSizeSection() {
	const [value, setValue] = useState<vec2>([100, 50])

	return (
		<section data-testid="InputSize">
			<h2>InputSize</h2>
			<InputSize value={value} onChange={setValue} />
			<output data-testid="size-value">{JSON.stringify(value)}</output>
		</section>
	)
}
