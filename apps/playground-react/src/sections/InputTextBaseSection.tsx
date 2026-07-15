import {InputTextBase} from '@tweeq/react'
import {useState} from 'react'

export default function InputTextBaseSection() {
	const [value, setValue] = useState('base text')

	return (
		<section data-testid="InputTextBase">
			<h2>InputTextBase</h2>
			<InputTextBase
				value={value}
				default="base text"
				leftIcon="char:T"
				onChange={setValue}
				onReset={() => setValue('base text')}
			/>
			<output>{value}</output>
		</section>
	)
}
