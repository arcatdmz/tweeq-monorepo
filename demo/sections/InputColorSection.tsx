import {useState} from 'react'

import {InputColor} from '../../src/react'

export default function InputColorSection() {
	const [value, setValue] = useState('#7c3aed')

	return (
		<section data-testid="InputColor">
			<h2>InputColor</h2>
			<div style={{width: 360}}>
				<InputColor value={value} onChange={setValue} presets={['#00ff88']} />
			</div>
			<output data-testid="color-value">{value}</output>
		</section>
	)
}
