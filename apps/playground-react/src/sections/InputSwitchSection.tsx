import {InputSwitch} from '@tweeq/react'
import {useState} from 'react'

export default function InputSwitchSection() {
	const [value, setValue] = useState(false)

	return (
		<section data-testid="InputSwitch">
			<h2>InputSwitch</h2>
			<InputSwitch value={value} label="Switch" onChange={setValue} />
			<output data-testid="switch-value">{String(value)}</output>
		</section>
	)
}
