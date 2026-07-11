import {Viewport} from '../../src/react'

export default function ViewportSection() {
	return (
		<section data-testid="Viewport">
			<h2>Viewport</h2>
			<Viewport data-testid="viewport-root">Viewport content</Viewport>
		</section>
	)
}
