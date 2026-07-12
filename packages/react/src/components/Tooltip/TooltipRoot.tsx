import {
	getTooltipSnapshot,
	setTooltipOpen,
	subscribeTooltip,
	TOOLTIP_ANCHOR_NAME,
} from '@tweeq/dom'
import {useSyncExternalStore} from 'react'

import {classNames} from '../../classNames'
import {Popover} from '../Popover'
import styles from './TooltipRoot.module.styl'

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
					className={classNames(styles.content, styles.structured)}
					data-tq-part="tooltip-content"
				>
					{tooltip.title && <div className={styles.title}>{tooltip.title}</div>}
					{tooltip.description && (
						<div className={styles.description}>{tooltip.description}</div>
					)}
				</div>
			) : tooltip.html ? (
				<div
					className={classNames(styles.content, styles.html)}
					data-tq-part="tooltip-content"
					dangerouslySetInnerHTML={{__html: tooltip.content}}
				/>
			) : (
				<div
					className={classNames(styles.content, styles.plain)}
					data-tq-part="tooltip-content"
				>
					{tooltip.content}
				</div>
			)}
		</Popover>
	)
}
