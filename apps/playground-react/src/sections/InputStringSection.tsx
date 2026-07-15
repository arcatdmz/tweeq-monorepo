import {InputString} from '@tweeq/react'
import {useState} from 'react'

export default function InputStringSection() {
	const [value, setValue] = useState('hello')

	return (
		<section data-testid="InputString">
			<h2>InputString</h2>
			<InputString value={value} default="hello" onChange={setValue} />
			<output data-testid="string-value">{value}</output>
		</section>
	)
}
