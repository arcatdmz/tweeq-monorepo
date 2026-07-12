import {
	getSwitchKeyValue,
	getSwitchTweakValue,
	type InputEvents,
} from '@tweeq/core'
import type {DragState} from '@tweeq/dom'
import {
	type ChangeEvent,
	type FocusEvent,
	type KeyboardEvent,
	type RefObject,
	useMemo,
	useRef,
	useState,
} from 'react'

import {type MultiSelectHook, useDrag, useMultiSelect} from '../../hooks'

export interface InputSwitchControls extends InputEvents {
	value: boolean
	onChange?: (value: boolean) => void
	disabled?: boolean
}

export function useInputSwitch({
	track,
	input,
	value,
	onChange,
	disabled = false,
	onFocus,
	onBlur,
	onConfirm,
}: InputSwitchControls & {
	track: RefObject<HTMLElement | null>
	input: RefObject<HTMLInputElement | null>
}) {
	const [tweakingValue, setTweakingValue] = useState<boolean | null>(null)
	const valueRef = useRef(value)
	valueRef.current = value
	const callbacksRef = useRef({onChange, onFocus, onBlur, onConfirm, disabled})
	callbacksRef.current = {onChange, onFocus, onBlur, onConfirm, disabled}

	const multi = useMultiSelect({
		type: 'boolean',
		getElement: () => track.current,
		getValue: () => valueRef.current,
		setValue: next => callbacksRef.current.onChange?.(Boolean(next)),
		confirm: () => callbacksRef.current.onConfirm?.(),
	})
	const multiRef = useRef<MultiSelectHook>(multi)
	multiRef.current = multi
	const valueOnTweak = useRef(false)

	const dragOptions = useMemo(
		() => ({
			disabled: () => callbacksRef.current.disabled,
			dragDelaySeconds: 0.2,
			onClick() {
				const currentMulti = multiRef.current
				if (!currentMulti.readyToBeSelected) {
					const next = !valueRef.current
					callbacksRef.current.onChange?.(next)
					currentMulti.update(other => !other)
				}
				callbacksRef.current.onConfirm?.()
				input.current?.focus()
			},
			onDragStart() {
				valueOnTweak.current = valueRef.current
				setTweakingValue(!valueOnTweak.current)
				callbacksRef.current.onFocus?.()
			},
			onDrag(state: DragState) {
				const next = getSwitchTweakValue({
					dragging: state.dragging,
					initialX: state.initial[0],
					currentX: state.xy[0],
					valueOnTweak: valueOnTweak.current,
				})
				if (next === null) return
				setTweakingValue(next)
				callbacksRef.current.onChange?.(next)
				multiRef.current.update(() => next)
			},
			onDragEnd() {
				setTweakingValue(null)
				callbacksRef.current.onConfirm?.()
				input.current?.focus()
			},
		}),
		[input]
	)
	useDrag(track, dragOptions)

	const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		const next = getSwitchKeyValue(event.key, valueRef.current)
		if (next === undefined) return
		event.preventDefault()
		event.stopPropagation()
		callbacksRef.current.onChange?.(next)
		callbacksRef.current.onConfirm?.()
	}
	const onChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
		callbacksRef.current.onChange?.(event.currentTarget.checked)
		callbacksRef.current.onConfirm?.()
	}
	const onFocusInput = (event: FocusEvent<HTMLInputElement>) => {
		multiRef.current.setFocusing(true)
		if (event.relatedTarget !== null) callbacksRef.current.onFocus?.()
	}
	const onBlurInput = () => {
		multiRef.current.setFocusing(false)
		callbacksRef.current.onBlur?.()
	}

	return {
		tweakingValue,
		subfocus: multi.subfocus,
		onKeyDown,
		onChangeInput,
		onFocusInput,
		onBlurInput,
	}
}
