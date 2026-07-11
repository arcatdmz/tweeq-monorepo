import {useState} from 'react'

import {InputTextBase} from '../../src/react'

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
