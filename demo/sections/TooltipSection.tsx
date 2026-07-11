import {useRef} from 'react'

import {useTooltip} from '../../src/react'

export default function TooltipSection() {
	const trigger = useRef<HTMLButtonElement>(null)
	useTooltip(trigger, {
		title: 'Hover help',
		description: 'Shared tooltip root',
	})

	return (
		<section data-testid="Tooltip">
			<h2>Tooltip</h2>
			<button ref={trigger}>Hover for tooltip</button>
		</section>
	)
}
