import {useState} from 'react'

import {Ruler} from '../../src/react'

export default function RulerSection() {
	const [value, setValue] = useState(0)

	return (
		<section data-testid="Ruler">
			<h2>Ruler</h2>
			<Ruler range={[0, 10]} onDrag={setValue} style={{height: 32}} />
			<output data-testid="ruler-value">{value.toFixed(1)}</output>
		</section>
	)
}
