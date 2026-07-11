import {useState} from 'react'

import {Popover} from '../../src/react'

export default function PopoverSection() {
	const [reference, setReference] = useState<HTMLButtonElement | null>(null)
	const [open, setOpen] = useState(false)

	return (
		<section data-testid="Popover">
			<h2>Popover</h2>
			<button ref={setReference} onClick={() => setOpen(value => !value)}>
				Toggle popover
			</button>
			<Popover
				reference={reference}
				open={open}
				arrow
				placement="bottom"
				onChangeOpen={setOpen}
			>
				<div data-testid="popover-content">Popover content</div>
			</Popover>
		</section>
	)
}
