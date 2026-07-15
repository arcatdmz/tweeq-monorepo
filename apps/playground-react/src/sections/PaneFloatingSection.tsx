import {InputButton, PaneFloating} from '@tweeq/react'
import {useState} from 'react'

export default function PaneFloatingSection() {
	const [open, setOpen] = useState(false)

	return (
		<section data-testid="PaneFloating">
			<h2>PaneFloating</h2>
			<InputButton
				label="Toggle floating pane"
				onClick={() => setOpen(current => !current)}
			/>
			{open && (
				<PaneFloating
					name="gallery-floating-relative"
					position={{anchor: 'right-top', width: 280, height: 120}}
					style={{position: 'relative', inset: 'auto', marginTop: '0.75rem'}}
				>
					Floating pane
				</PaneFloating>
			)}
		</section>
	)
}
