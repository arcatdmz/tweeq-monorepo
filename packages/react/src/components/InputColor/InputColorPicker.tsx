import {
	type ColorPickerComponent,
	css2hsva,
	DEFAULT_COLOR_PICKERS,
	type HSVA,
	hsva2hex,
} from '@tweeq/core'
import {type HTMLAttributes, useEffect, useRef, useState} from 'react'

import {classNames} from '../../classNames'
import {Icon} from '../Icon'
import {InputColorChannelPad} from './InputColorChannelPad'
import {InputColorChannelSlider} from './InputColorChannelSlider'
import {InputColorChannelValues} from './InputColorChannelValues'
import styles from './InputColorPicker.module.styl'
import {InputColorPresets} from './InputColorPresets'

interface EyeDropperResult {
	sRGBHex: string
}

interface EyeDropperConstructor {
	new (): {open(): Promise<EyeDropperResult>}
}

export interface InputColorPickerProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
	value: string
	onChange?: (value: string) => void
	onConfirm?: () => void
	alpha?: boolean
	pickers?: readonly ColorPickerComponent[]
	presets?: readonly string[]
}

export function InputColorPicker({
	value,
	onChange,
	onConfirm,
	alpha = true,
	pickers = DEFAULT_COLOR_PICKERS,
	presets,
	className,
	...props
}: InputColorPickerProps) {
	const [local, setLocal] = useState<HSVA>(() => css2hsva(value))
	const emitted = useRef<string | null>(null)

	useEffect(() => {
		if (value !== emitted.current) setLocal(css2hsva(value))
	}, [value])

	const updateLocal = (next: HSVA) => {
		setLocal(next)
		emitted.current = hsva2hex(next)
		onChange?.(emitted.current)
	}
	const updateCode = (next: string) => {
		setLocal(css2hsva(next))
		emitted.current = next
		onChange?.(next)
	}
	const EyeDropper =
		typeof window === 'undefined'
			? undefined
			: (window as unknown as {EyeDropper?: EyeDropperConstructor}).EyeDropper

	return (
		<div {...props} className={classNames(styles.picker, className)}>
			{pickers.map((picker, index) => {
				if (picker[0] === 'pad') {
					return (
						<InputColorChannelPad
							key={index}
							value={local}
							axes={picker[1]}
							onChange={updateLocal}
						/>
					)
				}
				if (picker[0] === 'slider') {
					if (!alpha && picker[1] === 'a') return null
					return (
						<InputColorChannelSlider
							key={index}
							value={local}
							axis={picker[1]}
							onChange={updateLocal}
						/>
					)
				}
				if (picker[0] === 'values') {
					return (
						<InputColorChannelValues
							key={index}
							colorCode={value}
							value={local}
							alpha={alpha}
							onChange={updateLocal}
							onChangeColorCode={updateCode}
						/>
					)
				}
				return null
			})}
			<InputColorPresets
				presets={presets}
				onChange={next => {
					updateCode(next)
					onConfirm?.()
				}}
			/>
			{EyeDropper && (
				<button
					type="button"
					className={styles.eyeDropper}
					aria-label="Pick a color from the screen"
					onClick={async () => {
						const result = await new EyeDropper().open()
						updateCode(result.sRGBHex)
						onConfirm?.()
					}}
				>
					<Icon icon="material-symbols:colorize" />
				</button>
			)}
		</div>
	)
}
