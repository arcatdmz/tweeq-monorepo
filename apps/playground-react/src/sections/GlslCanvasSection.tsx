import {GlslCanvas} from '@tweeq/react'

export default function GlslCanvasSection() {
	return (
		<section data-testid="GlslCanvas">
			<h2>GlslCanvas</h2>
			<GlslCanvas style={{width: 160, height: 48}} />
		</section>
	)
}
