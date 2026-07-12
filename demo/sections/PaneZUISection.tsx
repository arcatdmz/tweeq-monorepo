import {PaneZUI} from '../../src/react'

export default function PaneZUISection() {
	return (
		<section data-testid="PaneZUI">
			<h2>PaneZUI</h2>
			<div style={{height: 140, width: 360}}>
				<PaneZUI background="dots">
					<button type="button">Canvas node</button>
				</PaneZUI>
			</div>
		</section>
	)
}
