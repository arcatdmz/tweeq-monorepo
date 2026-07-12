import {BindIcon} from '../../src/react'

export default function BindIconSection() {
	return (
		<section data-testid="BindIcon">
			<h2>BindIcon</h2>
			<BindIcon icon={['⌘', '+', 'K']} />
		</section>
	)
}
