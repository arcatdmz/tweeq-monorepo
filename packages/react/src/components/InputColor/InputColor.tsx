import {
	type ColorPickerComponent,
	type InputBoxProps,
	type InputEvents,
	validator,
} from '@tweeq/core'
import {themeStore} from '@tweeq/dom'
import chroma from 'chroma-js'
import {type HTMLAttributes, useRef, useState} from 'react'
import {useStore} from 'zustand'

import {useElementBounding} from '../../hooks'
import {InputGroup} from '../InputGroup'
import {InputNumber} from '../InputNumber'
import {InputString} from '../InputString'
import {InputColorPad} from './InputColorPad'

export interface InputColorProps
	extends InputBoxProps,
		InputEvents,
		Omit<HTMLAttributes<HTMLDivElement>, 'onBlur' | 'onChange' | 'onFocus'> {
	value: string
	onChange?: (value: string) => void
	alpha?: boolean
	pickers?: readonly ColorPickerComponent[]
	presets?: readonly string[]
}

export function InputColor({
	value,
	onChange,
	alpha: alphaEnabled = true,
	pickers,
	presets,
	disabled,
	invalid,
	inlinePosition,
	blockPosition,
	onFocus,
	onBlur,
	onConfirm,
	className,
	...props
}: InputColorProps) {
	const root = useRef<HTMLDivElement>(null)
	const {width} = useElementBounding(root)
	const inputHeight = useStore(themeStore, state => state.inputHeight)
	const [padTweaking, setPadTweaking] = useState(false)
	const parsed = chroma.valid(value) ? chroma(value) : chroma('black')
	const opaqueColor = parsed.alpha(1).hex()
	const alpha = parsed.alpha() * 100
	const showColorCode = width > inputHeight * 3.5

	return (
		<InputGroup
			{...props}
			ref={root}
			className={className}
			data-inline-position={inlinePosition}
			data-block-position={blockPosition}
			data-tq-component="input-color"
			data-tq-part="root"
		>
			<InputColorPad
				data-tq-layout={!showColorCode ? 'only-pad' : undefined}
				data-tq-part="pad"
				value={value}
				onChange={onChange}
				alpha={alphaEnabled}
				pickers={pickers}
				presets={presets}
				disabled={disabled}
				invalid={invalid}
				onChangeTweaking={setPadTweaking}
				onFocus={onFocus}
				onBlur={onBlur}
				onConfirm={onConfirm}
			/>
			{showColorCode && (
				<InputString
					data-tq-pad-tweaking={padTweaking ? '' : undefined}
					data-tq-part="color-code"
					font="monospace"
					value={opaqueColor}
					validator={validator.colorCode}
					disabled={disabled}
					invalid={invalid}
					onChange={next => {
						const nextColor = chroma(next)
						onChange?.(
							nextColor.alpha() * 100 !== alpha
								? next
								: nextColor.alpha(alpha / 100).hex()
						)
					}}
					onFocus={onFocus}
					onBlur={onBlur}
					onConfirm={onConfirm}
				/>
			)}
			{alphaEnabled && showColorCode && (
				<InputNumber
					data-tq-part="alpha"
					value={alpha}
					min={0}
					max={100}
					suffix="%"
					disabled={disabled}
					invalid={invalid}
					onChange={next => onChange?.(parsed.alpha(next / 100).hex())}
					onFocus={onFocus}
					onBlur={onBlur}
					onConfirm={onConfirm}
				/>
			)}
		</InputGroup>
	)
}
