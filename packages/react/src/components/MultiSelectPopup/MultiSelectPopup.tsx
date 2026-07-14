import {
	addAnchorName,
	getMultiSelectActions,
} from '@tweeq/dom'
import {type CSSProperties, useEffect, useMemo, useRef} from 'react'
import {useStore} from 'zustand'

import {useTweeqRuntime} from '../../runtime'
import {Icon} from '../Icon'
import {MultiSelectButton} from './MultiSelectButton'
import {MultiSelectPad} from './MultiSelectPad'

const ANCHOR_NAME = '--tq-multi-select-anchor'

export function MultiSelectPopup() {
	const {multiSelectStore} = useTweeqRuntime()
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
	}, [multiSelectStore, visible])

	return (
		<div
			ref={root}
			className="TqMultiSelectPopup"
			style={
				{
					positionAnchor: ANCHOR_NAME,
					top: 'anchor(bottom)',
					right: 'anchor(right)',
				} as CSSProperties
			}
			popover="manual"
			data-tq-component="multi-select-popup"
			data-tq-visible={visible ? '' : undefined}
			data-tq-part="root"
		>
			<Icon icon="lsicon:control-filled" data-tq-part="tune-icon" />
			<div data-tq-part="actions">
				{enabled.map(action =>
					action.type === 'button' ? (
						<MultiSelectButton
							key={action.icon}
							icon={action.icon}
							label={action.label}
							update={action.update}
						/>
					) : (
						<MultiSelectPad
							key={action.icon}
							type={action.type}
							icon={action.icon}
							label={action.label}
							update={action.update}
						/>
					)
				)}
			</div>
		</div>
	)
}
