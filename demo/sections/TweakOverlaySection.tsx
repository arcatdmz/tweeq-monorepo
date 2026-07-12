import {TweakOverlay} from '../../src/react'

export default function TweakOverlaySection() {
	return (
		<section data-testid="TweakOverlay">
			<h2>TweakOverlay</h2>
			<TweakOverlay data-testid="tweak-overlay">
				<div data-testid="tweak-overlay-content">Top-layer overlay</div>
			</TweakOverlay>
		</section>
	)
}
