import {InputButton, PaneModal} from '@tweeq/react'
import {useState} from 'react'

export default function PaneModalSection() {
	const [open, setOpen] = useState(false)
	return (
		<section data-testid="PaneModal">
			<h2>PaneModal</h2>
			<InputButton label="Open plain modal" onClick={() => setOpen(true)} />
			<PaneModal open={open}>
				<div>Plain modal content</div>
				<InputButton label="Close plain modal" onClick={() => setOpen(false)} />
			</PaneModal>
		</section>
	)
}
