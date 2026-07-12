import {useState} from 'react'

import {InputComplex, type Scheme} from '../../src/react'

type Value = {amount: number; enabled: boolean; label: string}

const scheme: Scheme<Value> = {
	amount: {type: 'number', min: 0, max: 100},
	enabled: {type: 'boolean'},
	label: {type: 'string'},
}

export default function InputComplexSection() {
	const [value, setValue] = useState<Value>({
		amount: 12,
		enabled: true,
		label: 'Demo',
	})
	return (
		<section data-testid="InputComplex">
			<h2>InputComplex</h2>
			<InputComplex
				value={value}
				onChange={setValue}
				scheme={scheme}
				title="Generated form"
			/>
			<output data-testid="complex-value">{JSON.stringify(value)}</output>
		</section>
	)
}
