import {
	compileStringExpression,
	type InputAlign,
	type InputBoxProps,
	type InputEvents,
	type InputFont,
	type InputTheme,
	type Validator,
	validator as validators,
} from '@tweeq/core'
import {
	forwardRef,
	type HTMLAttributes,
	useImperativeHandle,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'

import {useMultiSelect, useValidator} from '../../hooks'
import {InputTextBase, type InputTextBaseHandle} from '../InputTextBase'

export interface InputStringProps
	extends InputBoxProps,
		InputEvents,
		Omit<
			HTMLAttributes<HTMLDivElement>,
			'default' | 'onBlur' | 'onChange' | 'onFocus'
		> {
	value: string
	onChange?: (value: string) => void
	theme?: InputTheme
	font?: InputFont
	align?: InputAlign
	validator?: Validator<string>
	default?: string
}

export interface InputStringHandle {
	select(): void
	blur(): void
}

export const InputString = forwardRef<InputStringHandle, InputStringProps>(
	function InputStringComponent(
		{
			value,
			onChange,
			theme,
			font,
			align,
			validator = validators.identity,
			default: defaultValue,
			disabled,
			invalid: invalidProp,
			inlinePosition,
			blockPosition,
			onFocus,
			onBlur,
			onConfirm,
			onKeyDown,
			...props
		},
		forwardedRef
	) {
		const [local, setLocal] = useState(value)
		const [display, setDisplay] = useState(value)
		const [focused, setFocused] = useState(false)
		const [expressionEnabled, setExpressionEnabled] = useState(false)
		const [expressionError, setExpressionError] = useState<string>()
		const base = useRef<InputTextBaseHandle>(null)
		const valueRef = useRef(value)
		valueRef.current = value
		const localRef = useRef(local)
		localRef.current = local
		const focusedRef = useRef(focused)
		focusedRef.current = focused
		const validatorRef = useRef(validator)
		validatorRef.current = validator
		const callbacksRef = useRef({onChange, onConfirm})
		callbacksRef.current = {onChange, onConfirm}
		const localAtFocus = useRef('')
		const lastExternalValue = useRef(value)
		const {validateResult} = useValidator(local, validator)

		useLayoutEffect(() => {
			if (Object.is(lastExternalValue.current, value)) return
			lastExternalValue.current = value
			setLocal(value)
			if (!focusedRef.current) setDisplay(value)
		}, [value])

		const applyLocal = (next: string, updateDisplay: boolean) => {
			setLocal(next)
			localRef.current = next
			if (updateDisplay) setDisplay(next)
			const result = validatorRef.current(next)
			if (result.value !== undefined && result.value !== valueRef.current) {
				callbacksRef.current.onChange?.(result.value)
			}
		}

		const multi = useMultiSelect({
			type: 'string',
			getElement: () => base.current?.getRoot() ?? null,
			getValue: () => localRef.current,
			setValue: next => applyLocal(String(next), !focusedRef.current),
			confirm: () => callbacksRef.current.onConfirm?.(),
		})

		const confirm = () => {
			onConfirm?.()
			multi.capture()
			multi.confirm()
			setExpressionEnabled(false)
			setExpressionError(undefined)
			queueMicrotask(() => {
				const current = valueRef.current
				setLocal(current)
				setDisplay(current)
			})
		}

		useImperativeHandle(
			forwardedRef,
			() => ({
				select: () => base.current?.select(),
				blur: () => base.current?.blur(),
			}),
			[]
		)

		return (
			<InputTextBase
				{...props}
				ref={base}
				value={display}
				active={multi.subfocus}
				theme={theme}
				font={font ?? (expressionEnabled ? 'monospace' : undefined)}
				align={align}
				inlinePosition={inlinePosition}
				blockPosition={blockPosition}
				disabled={disabled}
				invalid={
					invalidProp ||
					validateResult.log.length > 0 ||
					Boolean(expressionError)
				}
				default={defaultValue}
				onFocus={() => {
					setFocused(true)
					focusedRef.current = true
					multi.setFocusing(true)
					multi.capture()
					onFocus?.()
				}}
				onBlur={() => {
					confirm()
					setFocused(false)
					focusedRef.current = false
					multi.setFocusing(false)
					onBlur?.()
				}}
				onChange={next => {
					setDisplay(next)
					if (expressionEnabled) {
						try {
							const expression = compileStringExpression(next)
							const result = expression(localAtFocus.current, {i: multi.index})
							applyLocal(result, false)
							setExpressionError(undefined)
							multi.update(expression)
						} catch (error) {
							setExpressionError((error as Error).message)
							multi.update(other => other)
						}
					} else {
						applyLocal(next, false)
						multi.update(() => next)
					}
				}}
				onKeyDown={event => {
					onKeyDown?.(event)
					if (event.defaultPrevented) return
					if (event.metaKey && event.key === '=') {
						event.preventDefault()
						setExpressionEnabled(true)
						setDisplay(`"${localRef.current}"`)
						localAtFocus.current = localRef.current
					}
				}}
				onConfirm={confirm}
				onReset={() => {
					if (defaultValue !== undefined) onChange?.(defaultValue)
				}}
			/>
		)
	}
)
