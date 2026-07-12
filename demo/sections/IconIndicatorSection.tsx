import {useState} from 'react'

import {IconIndicator} from '../../src/react'

export default function IconIndicatorSection() {
	const [active, setActive] = useState(false)

	return (
		<section data-testid="IconIndicator">
			<h2>IconIndicator</h2>
			<IconIndicator
				active={active}
				data-testid="indicator-control"
				icon="char:●"
				onChangeActive={setActive}
			/>
			<output data-testid="indicator-value">{String(active)}</output>
		</section>
	)
}
