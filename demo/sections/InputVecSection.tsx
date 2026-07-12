import {useState} from 'react'

import {InputVec} from '../../src/react'

export default function InputVecSection() {
	const [value, setValue] = useState<readonly [number, number, number]>([
		1, 2, 3,
	])

	return (
		<section data-testid="InputVec">
			<h2>InputVec</h2>
			<InputVec
				value={value}
				icon={['char:X', 'char:Y', 'char:Z']}
				onChange={setValue}
			/>
			<output data-testid="vec-value">{JSON.stringify(value)}</output>
		</section>
	)
}
