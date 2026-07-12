import {TitleBar} from '../../src/react'

export default function TitleBarSection() {
	return (
		<section data-testid="TitleBar">
			<h2>TitleBar</h2>
			<TitleBar
				name="Tweeq Demo"
				icon="/favicon.svg"
				style={{position: 'relative'}}
				center="Center"
				right="Right"
			/>
		</section>
	)
}
