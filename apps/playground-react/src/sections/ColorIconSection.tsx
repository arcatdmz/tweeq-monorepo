import {ColorIcon} from '@tweeq/react'

import {colorMask} from '../galleryAssets'

export default function ColorIconSection() {
	return (
		<section data-testid="ColorIcon">
			<h2>ColorIcon</h2>
			<ColorIcon src={colorMask} style={{width: 24}} />
		</section>
	)
}
