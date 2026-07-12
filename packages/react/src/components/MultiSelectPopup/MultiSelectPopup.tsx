import './MultiSelectPopup.global.styl'

import {
	addAnchorName,
	getMultiSelectActions,
	multiSelectStore,
} from '@tweeq/dom'
import {type CSSProperties, useEffect, useMemo, useRef} from 'react'
import {useStore} from 'zustand'

import {classNames} from '../../classNames'
import {Icon} from '../Icon'
import {MultiSelectButton} from './MultiSelectButton'
import {MultiSelectPad} from './MultiSelectPad'
import styles from './MultiSelectPopup.module.styl'

const ANCHOR_NAME = '--tq-multi-select-anchor'

export function MultiSelectPopup() {
	const root = useRef<HTMLDivElement>(null)
	useStore(multiSelectStore)
	const state = multiSelectStore.getState()
	const selected = state.getSelectedInputs()
	const focusedElement = state.getFocusedElement()

	const enabled = useMemo(() => getMultiSelectActions(selected), [selected])
	const visible = selected.length > 1 && enabled.length > 0

	useEffect(() => {
		if (!focusedElement) return
		return addAnchorName(focusedElement, ANCHOR_NAME)
	}, [focusedElement])
	useEffect(() => {
		const element = root.current
		if (!element) return
		multiSelectStore.getState().setPopupEl(element)
		try {
			if (visible && !element.matches(':popover-open')) element.showPopover()
			else if (!visible && element.matches(':popover-open'))
				element.hidePopover()
		} catch {
			// Unsupported native popover.
		}
		return () => multiSelectStore.getState().setPopupEl(null)
	}, [visible])

	return (
		<div
			ref={root}
			className={classNames(
				'TqMultiSelectPopup',
				styles.popup,
				visible && styles.visible
			)}
			style={
				{
					positionAnchor: ANCHOR_NAME,
					top: 'anchor(bottom)',
					right: 'anchor(right)',
				} as CSSProperties
			}
			popover="manual"
			data-tq-part="root"
		>
			<Icon className={styles.tuneIcon} icon="lsicon:control-filled" />
			<div className={styles.actions} data-tq-part="actions">
				{enabled.map(action =>
					action.type === 'button' ? (
						<MultiSelectButton
							key={action.icon}
							icon={action.icon}
							update={action.update}
						/>
					) : (
						<MultiSelectPad
							key={action.icon}
							type={action.type}
							icon={action.icon}
							update={action.update}
						/>
					)
				)}
			</div>
		</div>
	)
}
