import {type CubicBezierValue, InputCubicBezier} from '@tweeq/react'
import {useState} from 'react'

export default function InputCubicBezierSection() {
	const [value, setValue] = useState<CubicBezierValue>([0.25, 0.1, 0.25, 1])

	return (
		<section data-testid="InputCubicBezier">
			<h2>InputCubicBezier</h2>
			<InputCubicBezier value={value} onChange={setValue} />
			<output data-testid="bezier-value">{value.join(',')}</output>
		</section>
	)
}
