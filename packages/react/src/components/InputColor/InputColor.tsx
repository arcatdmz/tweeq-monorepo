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

import {classNames} from '../../classNames'
import {useElementBounding} from '../../hooks'
import {InputGroup} from '../InputGroup'
import {InputNumber} from '../InputNumber'
import {InputString} from '../InputString'
import styles from './InputColor.module.styl'
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
			className={classNames(styles.inputColor, className)}
			data-inline-position={inlinePosition}
			data-block-position={blockPosition}
			data-tq-part="root"
		>
			<InputColorPad
				className={classNames(!showColorCode && styles.onlyPad)}
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
					className={classNames(
						styles.colorCode,
						padTweaking && styles.padTweaking
					)}
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
					className={styles.alpha}
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
