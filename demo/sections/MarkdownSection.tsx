import {Markdown} from '../../src/react'

export default function MarkdownSection() {
	return (
		<section data-testid="Markdown">
			<h2>Markdown</h2>
			<Markdown
				source={'# Rendered heading\n\nA [Tweeq](https://example.com) link.'}
			/>
		</section>
	)
}
