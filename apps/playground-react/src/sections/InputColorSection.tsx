import {InputColor} from '@tweeq/react'
import {useState} from 'react'

export default function InputColorSection() {
	const [value, setValue] = useState('#7c3aed')

	return (
		<section data-testid="InputColor">
			<h2>InputColor</h2>
			<div style={{width: 'min(360px, 100%)'}}>
				<InputColor value={value} onChange={setValue} presets={['#00ff88']} />
			</div>
			<output data-testid="color-value">{value}</output>
		</section>
	)
}
