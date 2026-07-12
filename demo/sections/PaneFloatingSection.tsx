import {PaneFloating} from '../../src/react'

export default function PaneFloatingSection() {
	return (
		<section data-testid="PaneFloating">
			<h2>PaneFloating</h2>
			<PaneFloating
				name="demo-floating"
				icon="material-symbols:dashboard"
				position={{anchor: 'right-top', width: 280, height: 120}}
				style={{position: 'relative', inset: 'auto'}}
			>
				Floating pane
			</PaneFloating>
		</section>
	)
}
