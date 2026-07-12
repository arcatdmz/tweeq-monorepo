import {App, TitleBar} from '../../src/react'

export default function AppSection() {
	return (
		<section data-testid="App">
			<h2>App</h2>
			<App
				appId="react-demo"
				withProvider={false}
				embedded
				title={
					<TitleBar
						name="Embedded"
						icon="/favicon.svg"
						style={{position: 'absolute'}}
					/>
				}
			>
				Embedded app content
			</App>
		</section>
	)
}
