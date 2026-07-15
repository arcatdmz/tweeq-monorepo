import {InputNumber} from '@tweeq/react'
import {useState} from 'react'

export default function InputNumberSection() {
	const [value, setValue] = useState(25)

	return (
		<section data-testid="InputNumber">
			<h2>InputNumber</h2>
			<InputNumber
				value={value}
				min={0}
				max={100}
				step={1}
				prefix="$"
				onChange={setValue}
			/>
			<output data-testid="number-value">{value}</output>
		</section>
	)
}
