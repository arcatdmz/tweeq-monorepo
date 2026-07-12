import {useState} from 'react'

import {InputButton, PaneModal} from '../../src/react'

export default function PaneModalSection() {
	const [open, setOpen] = useState(false)
	return (
		<section data-testid="PaneModal">
			<h2>PaneModal</h2>
			<InputButton label="Open plain modal" onClick={() => setOpen(true)} />
			<PaneModal open={open}>
				<p>Plain modal content</p>
				<InputButton label="Close plain modal" onClick={() => setOpen(false)} />
			</PaneModal>
		</section>
	)
}
