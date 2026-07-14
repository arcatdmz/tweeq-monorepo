import {TitleBar} from '@tweeq/react'

import {colorMask} from '../galleryAssets'

export default function TitleBarSection() {
	return (
		<section data-testid="TitleBar">
			<h2>TitleBar</h2>
			<TitleBar
				name="Gallery"
				icon={colorMask}
				style={{position: 'relative'}}
				center="Center"
				right="Right"
			/>
		</section>
	)
}
