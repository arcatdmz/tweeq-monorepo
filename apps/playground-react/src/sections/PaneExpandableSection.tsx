import {PaneExpandable} from '@tweeq/react'

import {paneExpandableIcon} from '../galleryAssets'

export default function PaneExpandableSection() {
	return (
		<section data-testid="PaneExpandable">
			<h2>PaneExpandable</h2>
			<PaneExpandable icon={paneExpandableIcon} persistent>
				<div data-testid="expandable-content">Expandable content</div>
			</PaneExpandable>
		</section>
	)
}
