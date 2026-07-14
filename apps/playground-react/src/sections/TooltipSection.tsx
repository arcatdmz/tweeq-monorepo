import {Tooltip, useTooltip} from '@tweeq/react'
import {useRef} from 'react'

export default function TooltipSection() {
	const trigger = useRef<HTMLButtonElement>(null)
	useTooltip(trigger, {
		title: 'Hover help',
		description: 'Shared tooltip root',
	})

	return (
		<section data-testid="Tooltip">
			<h2>Tooltip</h2>
			<Tooltip>Tooltip presentation surface</Tooltip>
			<button ref={trigger}>Hover for tooltip</button>
		</section>
	)
}
