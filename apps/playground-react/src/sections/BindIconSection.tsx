import {BindIcon} from '@tweeq/react'

export default function BindIconSection() {
	return (
		<section data-testid="BindIcon">
			<h2>BindIcon</h2>
			<BindIcon icon={['⌘', '+', 'K']} />
		</section>
	)
}
