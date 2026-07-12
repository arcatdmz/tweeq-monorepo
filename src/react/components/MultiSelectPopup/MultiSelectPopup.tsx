import './MultiSelectPopup.global.styl'

import {type CSSProperties, useEffect, useMemo, useRef} from 'react'
import {useStore} from 'zustand'

import {
	addAnchorName,
	multiSelectStore,
	type MultiSelectType,
} from '../../../core'
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
	const types = selected.map(input => input.type)
	const focusedElement = state.getFocusedElement()

	const actions = useMemo(
		() => [
			{
				type: 'slider' as const,
				enabled: (current: MultiSelectType[]) =>
					current.every(type => type === 'number'),
				update: (pixels: number) => (values: number[]) =>
					values.map(
						(value, index) => value + pixels * (selected[index]?.speed ?? 1)
					),
				icon: 'material-symbols:add',
			},
			{
				type: 'slider' as const,
				enabled: (current: MultiSelectType[]) =>
					current.every(type => type === 'number'),
				update: (pixels: number) => (values: number[]) =>
					values.map(value => value * (pixels / 100 + 1)),
				icon: 'mdi:multiply',
			},
			{
				type: 'pad' as const,
				enabled: (current: MultiSelectType[]) =>
					current.length === 2 && current.every(type => type === 'number'),
				update: (delta: readonly [number, number]) => (values: number[]) => [
					values[0] + delta[0] * (selected[0]?.speed ?? 1),
					values[1] - delta[1] * (selected[1]?.speed ?? 1),
				],
				icon: 'mdi:dots-grid',
			},
			{
				type: 'button' as const,
				enabled: (current: MultiSelectType[]) =>
					current.length === 2 &&
					current[0] !== 'boolean' &&
					current[0] === current[1],
				update: (values: number[]) => [...values].reverse(),
				icon: 'material-symbols:swap-vert',
			},
		],
		[selected]
	)
	const enabled = actions.filter(action => action.enabled(types))
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
		>
			<Icon className={styles.tuneIcon} icon="lsicon:control-filled" />
			<div className={styles.actions}>
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
