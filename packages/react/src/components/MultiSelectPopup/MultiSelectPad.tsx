import {
	type DragState,
	moveMultiSelectAction,
	type MultiSelectKeyboardValue,
} from '@tweeq/dom'
import {type vec2} from 'linearly'
import {useEffect, useMemo, useRef, useState} from 'react'

import {useDrag, useKeys} from '../../hooks'
import {useTweeqRuntime} from '../../runtime'
import {IconIndicator} from '../IconIndicator'

const PAD_KEYS = ['x', 'y', '1', '2'] as const

export interface MultiSelectPadProps {
	type: 'slider' | 'pad'
	update:
		| ((delta: number) => (values: number[]) => number[])
		| ((delta: vec2) => (values: number[]) => number[])
	icon: string
	label: string
}

export function MultiSelectPad({type, update, icon, label}: MultiSelectPadProps) {
	const {multiSelectStore} = useTweeqRuntime()
	const root = useRef<HTMLDivElement>(null)
	const keys = useKeys(PAD_KEYS)
	const keysRef = useRef(keys)
	keysRef.current = keys
	const updateRef = useRef(update)
	updateRef.current = update
	const typeRef = useRef(type)
	typeRef.current = type
	const origin = useRef<vec2>([0, 0])
	const previousConstraint = useRef(false)
	const [keyboardValue, setKeyboardValue] = useState<MultiSelectKeyboardValue>(
		type === 'slider' ? 0 : [0, 0]
	)
	const keyboardValueRef = useRef(keyboardValue)
	keyboardValueRef.current = keyboardValue
	const keyboardEditing = useRef(false)

	const resetKeyboardValue = () => {
		const value: MultiSelectKeyboardValue =
			typeRef.current === 'slider' ? 0 : [0, 0]
		keyboardValueRef.current = value
		setKeyboardValue(value)
	}

	const finishKeyboardEdit = () => {
		if (!keyboardEditing.current) return
		multiSelectStore.getState().confirmValues()
		keyboardEditing.current = false
	}

	const rollbackKeyboardEdit = () => {
		if (!keyboardEditing.current) return
		const zero: MultiSelectKeyboardValue =
			typeRef.current === 'slider' ? 0 : [0, 0]
		const apply = updateRef.current(zero as never)
		multiSelectStore.getState().updateValues(apply)
		finishKeyboardEdit()
		resetKeyboardValue()
	}

	const options = useMemo(
		() => ({
			lockPointer: true,
			onDragStart(state: DragState) {
				finishKeyboardEdit()
				resetKeyboardValue()
				multiSelectStore.getState().captureValues()
				origin.current = state.xy
			},
			onDrag(state: DragState) {
				let delta: vec2 = [
					state.xy[0] - origin.current[0],
					state.xy[1] - origin.current[1],
				]
				if (typeRef.current === 'slider') {
					const apply = (updateRef.current as MultiSelectPadProps['update'])(
						delta[0] as never
					)
					multiSelectStore.getState().updateValues(apply)
				} else {
					if (keysRef.current.x || keysRef.current['1']) delta = [delta[0], 0]
					else if (keysRef.current.y || keysRef.current['2'])
						delta = [0, delta[1]]
					const apply = (
						updateRef.current as (delta: vec2) => (values: number[]) => number[]
					)(delta)
					multiSelectStore.getState().updateValues(apply)
				}
			},
			onDragEnd() {
				multiSelectStore.getState().confirmValues()
			},
		}),
		[multiSelectStore]
	)
	const drag = useDrag(root, options)

	const keyboardDescription =
		type === 'slider'
			? 'Use Left or Down to decrease and Right or Up to increase. Home and End set the relative range limits. Shift changes by 10; Alt changes by 0.1.'
			: `Use Left and Right to adjust the first selected value, and Up and Down to adjust the second. Shift changes by 10; Alt changes by 0.1. Current relative adjustments: first ${
					(keyboardValue as readonly [number, number])[0]
				}, second ${-(keyboardValue as readonly [number, number])[1]}.`

	useEffect(() => {
		const constrained = keys.x || keys.y || keys['1'] || keys['2']
		if (constrained && !previousConstraint.current) {
			multiSelectStore.getState().captureValues()
			origin.current = drag.xy
		}
		previousConstraint.current = constrained
	}, [drag.xy, keys, multiSelectStore])

	return (
		<div
			ref={root}
			role={type === 'slider' ? 'slider' : 'application'}
			aria-roledescription={
				type === 'pad' ? 'two-axis relative adjustment' : undefined
			}
			aria-label={label}
			aria-description={keyboardDescription}
			aria-orientation={type === 'slider' ? 'horizontal' : undefined}
			aria-valuemin={type === 'slider' ? -100 : undefined}
			aria-valuemax={type === 'slider' ? 100 : undefined}
			aria-valuenow={
				type === 'slider' ? (keyboardValue as number) : undefined
			}
			aria-valuetext={
				type === 'slider'
					? `Relative adjustment ${keyboardValue as number}`
					: undefined
			}
			aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home End PageUp PageDown"
			tabIndex={0}
			onFocus={() => {
				resetKeyboardValue()
				multiSelectStore.getState().captureValues()
			}}
			onBlur={finishKeyboardEdit}
			onKeyDown={event => {
				if (event.key === 'Escape' && keyboardEditing.current) {
					event.preventDefault()
					rollbackKeyboardEdit()
					return
				}
				const next = moveMultiSelectAction({
					type,
					value: keyboardValueRef.current,
					key: event.key,
					shiftKey: event.shiftKey,
					altKey: event.altKey,
				})
				if (next === undefined) return
				event.preventDefault()
				if (!keyboardEditing.current) {
					multiSelectStore.getState().captureValues()
					keyboardEditing.current = true
				}
				keyboardValueRef.current = next
				setKeyboardValue(next)
				const apply = updateRef.current(next as never)
				multiSelectStore.getState().updateValues(apply)
			}}
			data-tq-multi-select-action={type}
			data-tq-dragging={drag.dragging ? '' : undefined}
			data-tq-part="pad"
		>
			<IconIndicator icon={icon} active={drag.dragging} interactive={false} />
		</div>
	)
}
