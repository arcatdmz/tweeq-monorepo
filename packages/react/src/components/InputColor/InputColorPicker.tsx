import {
	type ColorPickerComponent,
	createInputColorPickerController,
	DEFAULT_COLOR_PICKERS,
	type HSVA,
} from '@tweeq/core'
import {type HTMLAttributes, useEffect, useMemo, useState} from 'react'

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
	disabled?: boolean
}

export function InputColorPicker({
	value,
	onChange,
	onConfirm,
	alpha = true,
	pickers = DEFAULT_COLOR_PICKERS,
	presets,
	disabled,
	className,
	...props
}: InputColorPickerProps) {
	const [, setLocal] = useState<HSVA>()
	const controller = useMemo(
		() => createInputColorPickerController(value),
		[]
	)
	controller.setCallbacks({onChange, onUpdate: setLocal})
	const local = controller.value

	useEffect(() => {
		controller.sync(value)
	}, [controller, value])
	const EyeDropper =
		typeof window === 'undefined'
			? undefined
			: (window as unknown as {EyeDropper?: EyeDropperConstructor}).EyeDropper

	return (
		<div
			{...props}
			className={classNames(styles.picker, className)}
			data-tq-part="picker"
		>
			{pickers.map((picker, index) => {
				if (picker[0] === 'pad') {
					return (
						<InputColorChannelPad
							key={index}
							value={local}
							axes={picker[1]}
							disabled={disabled}
							onChange={controller.updateHSVA}
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
							disabled={disabled}
							onChange={controller.updateHSVA}
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
							disabled={disabled}
							onChange={controller.updateHSVA}
							onChangeColorCode={controller.updateCode}
						/>
					)
				}
				return null
			})}
			<InputColorPresets
				presets={presets}
				disabled={disabled}
				onChange={next => {
					controller.updateCode(next)
					onConfirm?.()
				}}
			/>
			{EyeDropper && (
				<button
					type="button"
					disabled={disabled}
					className={styles.eyeDropper}
					aria-label="Pick a color from the screen"
					data-tq-part="eye-dropper"
					onClick={async () => {
						try {
							const result = await new EyeDropper().open()
							controller.updateCode(result.sRGBHex)
							onConfirm?.()
						} catch (error) {
							if (error instanceof DOMException && error.name === 'AbortError') return
							throw error
						}
					}}
				>
					<Icon icon="material-symbols:colorize" />
				</button>
			)}
		</div>
	)
}
