import type {InputEvents} from '@tweeq/core'
import {themeStore} from '@tweeq/dom'
import {useRef} from 'react'
import {useStore} from 'zustand'

import {useElementBounding} from '../../hooks'
import {InputNumber} from '../InputNumber'
import {InputRotary, type InputRotaryProps} from '../InputRotary'
import styles from './InputAngle.module.styl'

export interface InputAngleProps
	extends Omit<
			InputRotaryProps,
			'onBlur' | 'onChange' | 'onConfirm' | 'onFocus'
		>,
		InputEvents {
	value: number
	onChange?: (value: number) => void
}

export function InputAngle(props: InputAngleProps) {
	const root = useRef<HTMLDivElement>(null)
	const {width} = useElementBounding(root)
	const inputHeight = useStore(themeStore, state => state.inputHeight)
	const shared = {
		value: props.value,
		onChange: props.onChange,
		disabled: props.disabled,
		invalid: props.invalid,
		onFocus: props.onFocus,
		onBlur: props.onBlur,
		onConfirm: props.onConfirm,
	}

	return (
		<div ref={root} className={styles.tqInputAngle} data-tq-part="angle-root">
			<InputRotary
				{...shared}
				snap={props.snap}
				angleOffset={props.angleOffset}
			/>
			{width > inputHeight * 4 && <InputNumber {...shared} suffix="°" />}
		</div>
	)
}
