import {PaneZUI} from '@tweeq/react'

export default function PaneZUISection() {
	return (
		<section data-testid="PaneZUI">
			<h2>PaneZUI</h2>
			<div style={{height: 140, width: 'min(360px, 100%)'}}>
				<PaneZUI background="dots">
					<button type="button">Canvas node</button>
				</PaneZUI>
			</div>
		</section>
	)
}
