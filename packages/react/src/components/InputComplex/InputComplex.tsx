import type {InputEvents} from '@tweeq/core'
import Case from 'case'
import {
	type ComponentType,
	createElement,
	type HTMLAttributes,
	useEffect,
	useRef,
} from 'react'

import {InputAngle, type InputAngleProps} from '../InputAngle'
import {InputCheckbox, type InputCheckboxProps} from '../InputCheckbox'
import {InputCode, type InputCodeProps} from '../InputCode'
import {InputColor, type InputColorProps} from '../InputColor'
import {InputNumber, type InputNumberProps} from '../InputNumber'
import {InputPosition, type InputPositionProps} from '../InputPosition'
import {InputString, type InputStringProps} from '../InputString'
import {InputSwitch, type InputSwitchProps} from '../InputSwitch'
import {InputTime, type InputTimeProps} from '../InputTime'
import {InputVec, type InputVecProps} from '../InputVec'
import {Parameter, ParameterGrid, ParameterHeading} from '../ParameterGrid'

type ControlProps<P> = Omit<P, 'onChange' | 'value'>
type ParameterBase = {label?: string; icon?: string}

type NumberDescriptor =
	| ({type: 'number'; ui?: undefined} & ControlProps<InputNumberProps>)
	| ({type: 'number'; ui: 'angle'} & ControlProps<InputAngleProps>)
	| ({type: 'number'; ui: 'time'} & ControlProps<InputTimeProps>)
type StringDescriptor =
	| ({type: 'string'; ui?: undefined} & ControlProps<InputStringProps>)
	| ({type: 'string'; ui: 'code'} & ControlProps<InputCodeProps>)
	| ({type: 'string'; ui: 'color'} & ControlProps<InputColorProps>)
type BooleanDescriptor =
	| ({type: 'boolean'; ui?: undefined} & ControlProps<InputSwitchProps>)
	| ({type: 'boolean'; ui: 'checkbox'} & ControlProps<InputCheckboxProps>)
type VecDescriptor =
	| ({type: 'vec2'; ui?: undefined} & ControlProps<
			InputVecProps<readonly number[]>
	  >)
	| ({type: 'vec2'; ui: 'position'} & ControlProps<InputPositionProps>)

export type ParameterDescriptor<T> = ParameterBase &
	(T extends number
		? NumberDescriptor
		: T extends string
			? StringDescriptor
			: T extends boolean
				? BooleanDescriptor
				: T extends readonly [number, number]
					? VecDescriptor
					: never)

export type Scheme<T extends Record<string, unknown>> = {
	[K in keyof T]: ParameterDescriptor<T[K]>
}

export interface InputComplexProps<T extends Record<string, unknown>>
	extends InputEvents,
		Omit<HTMLAttributes<HTMLUListElement>, 'onBlur' | 'onChange' | 'onFocus'> {
	value: T
	onChange?: (value: T) => void
	scheme: Scheme<T>
	title?: string
}

function getControl(param: {type: string; ui?: string}): ComponentType<any> {
	if (param.type === 'number') {
		if (param.ui === 'angle') return InputAngle
		if (param.ui === 'time') return InputTime
		return InputNumber
	}
	if (param.type === 'string') {
		if (param.ui === 'code') return InputCode
		if (param.ui === 'color') return InputColor
		return InputString
	}
	if (param.type === 'boolean') {
		if (param.ui === 'checkbox') return InputCheckbox
		return InputSwitch
	}
	if (param.type === 'vec2') {
		if (param.ui === 'position') return InputPosition
		return InputVec
	}
	throw new Error(`Unsupported InputComplex type: ${param.type}`)
}

export function InputComplex<T extends Record<string, unknown>>({
	value,
	onChange,
	scheme,
	title,
	onFocus,
	onBlur,
	onConfirm,
	className,
	...props
}: InputComplexProps<T>) {
	const valueRef = useRef(value)
	valueRef.current = value
	const callbacks = useRef({onChange, onConfirm})
	callbacks.current = {onChange, onConfirm}
	const pending = useRef<T | undefined>(undefined)
	const changeQueued = useRef(false)
	const confirmQueued = useRef(false)
	useEffect(
		() => () => {
			changeQueued.current = false
			confirmQueued.current = false
		},
		[]
	)

	const update = (name: keyof T, next: unknown) => {
		pending.current ??= {...valueRef.current}
		pending.current[name] = next as T[keyof T]
		if (changeQueued.current) return
		changeQueued.current = true
		queueMicrotask(() => {
			if (!changeQueued.current) return
			changeQueued.current = false
			const changed = pending.current
			pending.current = undefined
			if (changed) callbacks.current.onChange?.(changed)
		})
	}
	const confirm = () => {
		if (confirmQueued.current) return
		confirmQueued.current = true
		queueMicrotask(() => {
			if (!confirmQueued.current) return
			confirmQueued.current = false
			callbacks.current.onConfirm?.()
		})
	}

	return (
		<ParameterGrid
			{...props}
			className={className}
			data-tq-variant="input-complex"
		>
			{title && <ParameterHeading>{title}</ParameterHeading>}
			{Object.entries(scheme).map(([name, descriptor]) => {
				const param = descriptor as ParameterBase & {type: string; ui?: string}
				const {label, icon} = param
				const controlProps = {...param} as Record<string, unknown>
				delete controlProps.label
				delete controlProps.icon
				delete controlProps.type
				delete controlProps.ui
				return (
					<Parameter key={name} label={label ?? Case.capital(name)} icon={icon}>
						{createElement(getControl(param), {
							...controlProps,
							value: value[name],
							onChange: (next: unknown) => update(name, next),
							onFocus,
							onBlur,
							onConfirm: confirm,
						})}
					</Parameter>
				)
			})}
		</ParameterGrid>
	)
}
