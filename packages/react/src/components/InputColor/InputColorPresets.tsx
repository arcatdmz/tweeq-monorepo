import {type HTMLAttributes} from 'react'

import {classNames} from '../../classNames'
import {useInputColorContext} from './InputColorContext'
import styles from './InputColorPresets.module.styl'

export interface InputColorPresetsProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
	presets?: readonly string[]
	onChange?: (value: string) => void
	disabled?: boolean
}

export function InputColorPresets({
	presets = [],
	onChange,
	disabled,
	className,
	...props
}: InputColorPresetsProps) {
	const {presets: inherited} = useInputColorContext()
	const merged = [...inherited, ...presets]

	return (
		<div
			{...props}
			className={classNames(styles.presets, className)}
			data-tq-part="presets"
		>
			{merged.map((preset, index) => (
				<button
					type="button"
					key={`${preset}-${index}`}
					disabled={disabled}
					aria-label={`Use ${preset}`}
					data-tq-part={`preset-${index}`}
					style={{background: preset}}
					onClick={() => onChange?.(preset)}
				/>
			))}
		</div>
	)
}
