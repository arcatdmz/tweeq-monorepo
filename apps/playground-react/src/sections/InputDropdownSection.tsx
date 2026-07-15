import {InputDropdown} from '@tweeq/react'
import {useState} from 'react'

const options = [
	'alpha',
	'beta',
	'gamma',
	'delta',
	'epsilon',
	'zeta',
	'eta',
	'theta',
	'iota',
	'kappa',
]

export default function InputDropdownSection() {
	const [value, setValue] = useState('alpha')

	return (
		<section data-testid="InputDropdown">
			<h2>InputDropdown</h2>
			<InputDropdown
				value={value}
				onChange={setValue}
				options={options}
				labels={options.map(option =>
					option.replace(/^./, letter => letter.toUpperCase())
				)}
			/>
			<output data-testid="dropdown-value">{value}</output>
		</section>
	)
}
