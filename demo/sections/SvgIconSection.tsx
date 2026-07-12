import {SvgIcon} from '../../src/react'

export default function SvgIconSection() {
	return (
		<section data-testid="SvgIcon">
			<h2>SvgIcon</h2>
			<SvgIcon data-testid="svg-icon" nonStrokeScaling strokeWidth={3}>
				<circle cx="16" cy="16" r="10" />
			</SvgIcon>
		</section>
	)
}
