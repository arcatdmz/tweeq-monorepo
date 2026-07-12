import {PaneExpandable} from '../../src/react'

export default function PaneExpandableSection() {
	return (
		<section data-testid="PaneExpandable">
			<h2>PaneExpandable</h2>
			<PaneExpandable icon="material-symbols:tune" persistent>
				<div data-testid="expandable-content">Expandable content</div>
			</PaneExpandable>
		</section>
	)
}
