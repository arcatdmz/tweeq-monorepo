import {ColorIcon} from '../../src/react'

const MASK =
	'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Ccircle cx="12" cy="12" r="10" fill="black"/%3E%3C/svg%3E'

export default function ColorIconSection() {
	return (
		<section data-testid="ColorIcon">
			<h2>ColorIcon</h2>
			<ColorIcon src={MASK} style={{width: 24}} />
		</section>
	)
}
