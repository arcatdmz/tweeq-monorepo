import {type HTMLAttributes} from 'react'

import {classNames} from '../../classNames'
import {useInputColorContext} from './InputColorContext'
import styles from './InputColorPresets.module.styl'

export interface InputColorPresetsProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
	presets?: readonly string[]
	onChange?: (value: string) => void
}

export function InputColorPresets({
	presets = [],
	onChange,
	className,
	...props
}: InputColorPresetsProps) {
	const {presets: inherited} = useInputColorContext()
	const merged = [...inherited, ...presets]

	return (
		<div {...props} className={classNames(styles.presets, className)}>
			{merged.map((preset, index) => (
				<button
					type="button"
					key={`${preset}-${index}`}
					aria-label={`Use ${preset}`}
					style={{background: preset}}
					onClick={() => onChange?.(preset)}
				/>
			))}
		</div>
	)
}
