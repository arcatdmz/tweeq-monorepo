import {
	type ColorChannel,
	type ColorSpace,
	hsv2rgb,
	type HSVA,
	setHSVAChannel,
	validator,
} from '@tweeq/core'

import {InputDropdown} from '../InputDropdown'
import {InputGroup} from '../InputGroup'
import {InputNumber} from '../InputNumber'
import {InputString} from '../InputString'
import {useInputColorContext} from './InputColorContext'

const COLOR_SPACES: ColorSpace[] = ['rgb', 'hsv', 'hex']

export interface InputColorChannelValuesProps {
	colorCode: string
	onChangeColorCode?: (value: string) => void
	value: HSVA
	onChange?: (value: HSVA) => void
	alpha?: boolean
	disabled?: boolean
}

export function InputColorChannelValues({
	colorCode,
	onChangeColorCode,
	value,
	onChange,
	alpha = true,
	disabled,
}: InputColorChannelValuesProps) {
	const {colorSpace, setColorSpace} = useInputColorContext()
	const rgb = hsv2rgb(value)
	const update = (channel: ColorChannel, next: number) =>
		onChange?.(setHSVAChannel(value, channel, next))

	return (
		<InputGroup
			component="input-color-channel-values"
			data-tq-part="root"
		>
			<InputDropdown
				data-tq-part="color-space"
				theme="minimal"
				disabled={disabled}
				value={colorSpace}
				onChange={setColorSpace}
				options={COLOR_SPACES}
				labelizer={space => space.toUpperCase()}
			/>
			{colorSpace === 'rgb' && (
				<InputGroup data-tq-part="channel">
					<InputNumber
						value={rgb.r * 255}
						min={0}
						max={255}
						precision={0}
						bar={false}
						disabled={disabled}
						onChange={next => update('r', next / 255)}
					/>
					<InputNumber
						value={rgb.g * 255}
						min={0}
						max={255}
						precision={0}
						bar={false}
						disabled={disabled}
						onChange={next => update('g', next / 255)}
					/>
					<InputNumber
						value={rgb.b * 255}
						min={0}
						max={255}
						precision={0}
						bar={false}
						disabled={disabled}
						onChange={next => update('b', next / 255)}
					/>
					{alpha && (
						<InputNumber
							value={value.a * 100}
							min={0}
							max={100}
							precision={0}
							bar={false}
							disabled={disabled}
							suffix="%"
							onChange={next => update('a', next / 100)}
						/>
					)}
				</InputGroup>
			)}
			{colorSpace === 'hsv' && (
				<InputGroup data-tq-part="channel">
					<InputNumber
						value={value.h * 360}
						min={0}
						max={360}
						precision={0}
						bar={false}
						disabled={disabled}
						suffix="°"
						onChange={next => update('h', next / 360)}
					/>
					<InputNumber
						value={value.s * 100}
						min={0}
						max={100}
						precision={0}
						bar={false}
						disabled={disabled}
						suffix="%"
						onChange={next => update('s', next / 100)}
					/>
					<InputNumber
						value={value.v * 100}
						min={0}
						max={100}
						precision={0}
						bar={false}
						disabled={disabled}
						suffix="%"
						onChange={next => update('v', next / 100)}
					/>
					{alpha && (
						<InputNumber
							value={value.a * 100}
							min={0}
							max={100}
							precision={0}
							bar={false}
							disabled={disabled}
							suffix="%"
							onChange={next => update('a', next / 100)}
						/>
					)}
				</InputGroup>
			)}
			{colorSpace === 'hex' && (
				<InputString
					data-tq-part="channel"
					font="monospace"
					value={colorCode}
					validator={validator.colorCode}
					disabled={disabled}
					onChange={onChangeColorCode}
				/>
			)}
		</InputGroup>
	)
}
