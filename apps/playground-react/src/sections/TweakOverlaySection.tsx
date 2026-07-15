import {TweakOverlay} from '@tweeq/react'
import {useState} from 'react'

export default function TweakOverlaySection() {
	const [show, setShow] = useState(false)

	return (
		<section data-testid="TweakOverlay">
			<h2>TweakOverlay</h2>
			<button
				type="button"
				data-testid="tweak-overlay-trigger"
				onPointerDown={() => setShow(true)}
				onPointerUp={() => setShow(false)}
				onPointerCancel={() => setShow(false)}
				onPointerLeave={() => setShow(false)}
			>
				Hold to show overlay
			</button>
			{show && (
				<TweakOverlay data-testid="tweak-overlay">
					<div data-testid="tweak-overlay-content">
						Intentional tweak gesture overlay
					</div>
				</TweakOverlay>
			)}
		</section>
	)
}
