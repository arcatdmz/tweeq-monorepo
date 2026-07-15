import {PaneSplit} from '@tweeq/react'

export default function PaneSplitSection() {
	return (
		<section data-testid="PaneSplit">
			<h2>PaneSplit</h2>
			<div style={{height: 140, width: 'min(360px, 100%)'}}>
				<PaneSplit
					data-testid="split-control"
					name="demo-split"
					direction="horizontal"
					first={<div>First pane</div>}
					second={<div>Second pane</div>}
				/>
			</div>
		</section>
	)
}
