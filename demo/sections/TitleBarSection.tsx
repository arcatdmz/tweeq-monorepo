import {TitleBar} from '../../src/react'
import {assetPath} from '../assetPath'

export default function TitleBarSection() {
	return (
		<section data-testid="TitleBar">
			<h2>TitleBar</h2>
			<TitleBar
				name="Tweeq Demo"
				icon={assetPath('logo.svg')}
				style={{position: 'relative'}}
				center="Center"
				right="Right"
			/>
		</section>
	)
}
