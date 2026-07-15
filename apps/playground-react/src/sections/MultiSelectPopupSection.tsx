import {InputNumber} from '@tweeq/react'
import {useState} from 'react'

export default function MultiSelectPopupSection() {
	const [first, setFirst] = useState(10)
	const [second, setSecond] = useState(20)

	return (
		<section data-testid="MultiSelectPopup">
			<h2>MultiSelectPopup</h2>
			<p>Hold Command/Ctrl while focusing both inputs to edit them together.</p>
			<InputNumber value={first} onChange={setFirst} />
			<InputNumber value={second} onChange={setSecond} />
			<output data-testid="multi-select-value">
				{first},{second}
			</output>
		</section>
	)
}
