import {InputAngle} from '@tweeq/react'
import {useState} from 'react'

export default function InputAngleSection() {
	const [value, setValue] = useState(30)

	return (
		<section data-testid="InputAngle">
			<h2>InputAngle</h2>
			<InputAngle value={value} onChange={setValue} />
			<output data-testid="angle-value">{value}</output>
		</section>
	)
}
