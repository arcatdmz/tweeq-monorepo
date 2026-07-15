import {InputShuffle} from '@tweeq/react'
import {useState} from 'react'

export default function InputShuffleSection() {
	const [value, setValue] = useState(1)

	return (
		<section data-testid="InputShuffle">
			<h2>InputShuffle</h2>
			<InputShuffle
				value={value}
				generate={current => current + 1}
				onChange={setValue}
			/>
			<output data-testid="shuffle-value">{value}</output>
		</section>
	)
}
