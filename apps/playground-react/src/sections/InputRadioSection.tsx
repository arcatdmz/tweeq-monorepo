import {InputRadio} from '@tweeq/react'
import {useState} from 'react'

export default function InputRadioSection() {
	const [value, setValue] = useState('alpha')

	return (
		<section data-testid="InputRadio">
			<h2>InputRadio</h2>
			<InputRadio
				value={value}
				options={['alpha', 'beta', 'gamma']}
				onChange={setValue}
			/>
			<output data-testid="radio-value">{value}</output>
		</section>
	)
}
