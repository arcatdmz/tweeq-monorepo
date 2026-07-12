import {useState} from 'react'

import {InputButton, modalStore, type Scheme} from '../../src/react'

type Value = {name: string; count: number}
const scheme: Scheme<Value> = {
	name: {type: 'string'},
	count: {type: 'number', min: 0},
}

export default function PaneModalComplexSection() {
	const [result, setResult] = useState('none')
	return (
		<section data-testid="PaneModalComplex">
			<h2>PaneModalComplex</h2>
			<InputButton
				label="Open generated modal"
				onClick={() => {
					void modalStore
						.getState()
						.prompt({name: 'Initial', count: 2}, scheme, {
							title: 'Edit values',
						})
						.then(value => setResult(value ? value.name : 'cancelled'))
				}}
			/>
			<output data-testid="modal-complex-value">{result}</output>
		</section>
	)
}
