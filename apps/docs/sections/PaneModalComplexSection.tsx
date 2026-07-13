import {InputButton, type Scheme, useTweeq} from '@tweeq/react'
import {useState} from 'react'

type Value = {name: string; count: number}
const scheme: Scheme<Value> = {
	name: {type: 'string'},
	count: {type: 'number', min: 0},
}

export default function PaneModalComplexSection() {
	const {modal} = useTweeq()
	const [result, setResult] = useState('none')
	return (
		<section data-testid="PaneModalComplex">
			<h2>PaneModalComplex</h2>
			<InputButton
				label="Open generated modal"
				onClick={() => {
					void modal
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
