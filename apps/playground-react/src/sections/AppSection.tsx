import {App, TitleBar} from '@tweeq/react'

import {colorMask} from '../galleryAssets'

export default function AppSection() {
	return (
		<section data-testid="App">
			<h2>App</h2>
			<App
				appId="gallery-embedded"
				withProvider={false}
				embedded
				title={
					<TitleBar
						name="Embedded App"
						icon={colorMask}
						style={{position: 'absolute'}}
					/>
				}
			>
				Embedded application content
			</App>
		</section>
	)
}
