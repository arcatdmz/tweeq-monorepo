import {InputButton, type Scheme, useTweeq} from '@tweeq/react'
import {useState} from 'react'

type Value = {speed: number}
const scheme: Scheme<Value> = {speed: {type: 'number', min: 0}}

export default function PaneModalTabsSection() {
	const {modal} = useTweeq()
	const [done, setDone] = useState(false)
	return (
		<section data-testid="PaneModalTabs">
			<h2>PaneModalTabs</h2>
			<InputButton
				label="Open tabbed modal"
				onClick={() => {
					void modal
						.promptTabs([
							{
								id: 'motion',
								title: 'Motion',
								value: {speed: 3},
								scheme,
							},
						])
						.then(() => setDone(true))
				}}
			/>
			<output data-testid="modal-tabs-value">{String(done)}</output>
		</section>
	)
}
