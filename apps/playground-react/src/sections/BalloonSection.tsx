import {Balloon} from '@tweeq/react'

export default function BalloonSection() {
	return (
		<section data-testid="Balloon">
			<h2>Balloon</h2>
			<Balloon arrowSide="top" arrowOffset={36} data-testid="balloon-root">
				Balloon content
			</Balloon>
		</section>
	)
}
