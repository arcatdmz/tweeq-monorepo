import {Timeline} from '@tweeq/react'
import {useState} from 'react'

export default function TimelineSection() {
	const [frameWidth, setFrameWidth] = useState(20)

	return (
		<section data-testid="Timeline">
			<h2>Timeline</h2>
			<Timeline
				frameRange={[0, 120]}
				frameWidth={frameWidth}
				onChangeFrameWidth={setFrameWidth}
				style={{height: 80}}
			>
				{({visibleFrameRange}) => (
					<div data-testid="timeline-range">
						{JSON.stringify(visibleFrameRange)}
					</div>
				)}
			</Timeline>
			<output data-testid="timeline-width">{frameWidth.toFixed(2)}</output>
		</section>
	)
}
