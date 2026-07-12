import {useState} from 'react'

import {InputDropdown} from '../../src/react'

const options = ['alpha', 'beta', 'gamma']

export default function InputDropdownSection() {
	const [value, setValue] = useState('alpha')

	return (
		<section data-testid="InputDropdown">
			<h2>InputDropdown</h2>
			<InputDropdown
				value={value}
				onChange={setValue}
				options={options}
				labels={['Alpha', 'Beta', 'Gamma']}
			/>
			<output data-testid="dropdown-value">{value}</output>
		</section>
	)
}
