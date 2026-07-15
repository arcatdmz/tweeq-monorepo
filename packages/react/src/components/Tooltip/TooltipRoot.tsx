import {
	getTooltipSnapshot,
	setTooltipOpen,
	subscribeTooltip,
	TOOLTIP_ANCHOR_NAME,
} from '@tweeq/dom'
import {useSyncExternalStore} from 'react'

import {Popover} from '../Popover'

export function TooltipRoot() {
	const tooltip = useSyncExternalStore(
		subscribeTooltip,
		getTooltipSnapshot,
		getTooltipSnapshot
	)

	return (
		<Popover
			reference={tooltip.reference}
			open={tooltip.open}
			anchorName={TOOLTIP_ANCHOR_NAME}
			placement="top"
			lightDismiss={false}
			arrow
			teleport=".TqViewport"
			onChangeOpen={open => {
				if (!open) setTooltipOpen(false)
			}}
		>
			{tooltip.title || tooltip.description ? (
				<div
					data-tq-component="tooltip-content"
					data-tq-part="tooltip-content"
					data-tq-variant="structured"
				>
					{tooltip.title && <div data-tq-part="title">{tooltip.title}</div>}
					{tooltip.description && (
						<div data-tq-part="description">{tooltip.description}</div>
					)}
				</div>
			) : tooltip.html ? (
				<div
					data-tq-component="tooltip-content"
					data-tq-part="tooltip-content"
					data-tq-variant="html"
					dangerouslySetInnerHTML={{__html: tooltip.content}}
				/>
			) : (
				<div
					data-tq-component="tooltip-content"
					data-tq-part="tooltip-content"
					data-tq-variant="plain"
				>
					{tooltip.content}
				</div>
			)}
		</Popover>
	)
}
