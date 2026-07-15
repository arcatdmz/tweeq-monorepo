import {InputCode} from '@tweeq/react'
import {useState} from 'react'

export default function InputCodeSection() {
	const [value, setValue] = useState('{\n  "enabled": true\n}')

	return (
		<section data-testid="InputCode">
			<h2>InputCode</h2>
			<InputCode value={value} onChange={setValue} lang="json" />
			<output data-testid="code-length">{value.length}</output>
		</section>
	)
}
