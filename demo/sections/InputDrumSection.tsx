import {useState} from 'react'

import {InputDrum} from '../../src/react'

export default function InputDrumSection() {
	const [value, setValue] = useState('Auto')

	return (
		<section data-testid="InputDrum">
			<h2>InputDrum</h2>
			<InputDrum
				value={value}
				options={['Auto', '100', '200', '400']}
				font="numeric"
				onChange={setValue}
			/>
			<output data-testid="drum-value">{value}</output>
		</section>
	)
}
