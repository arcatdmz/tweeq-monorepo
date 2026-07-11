import {useState} from 'react'

import {InputCheckbox} from '../../src/react'

export default function InputCheckboxSection() {
	const [value, setValue] = useState(false)

	return (
		<section data-testid="InputCheckbox">
			<h2>InputCheckbox</h2>
			<InputCheckbox value={value} label="Checkbox" onChange={setValue} />
			<output data-testid="checkbox-value">{String(value)}</output>
		</section>
	)
}
