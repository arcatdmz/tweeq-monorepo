import {MonacoEditor} from '@tweeq/react'
import {useState} from 'react'

export default function MonacoEditorSection() {
	const [value, setValue] = useState('const answer = 42')

	return (
		<section data-testid="MonacoEditor">
			<h2>MonacoEditor</h2>
			<div style={{height: 180}}>
				<MonacoEditor value={value} onChange={setValue} lang="typescript" />
			</div>
			<output data-testid="monaco-length">{value.length}</output>
		</section>
	)
}
