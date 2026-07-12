import {useMemo, useRef} from 'react'

import {useElementBounding} from '../../hooks'
import styles from './InputNumberScales.module.styl'

export interface InputNumberScalesProps {
	min?: number
	max?: number
	step?: number
}

export function InputNumberScales({min, max, step}: InputNumberScalesProps) {
	const element = useRef<HTMLDivElement>(null)
	const {width} = useElementBounding(element)
	const gap =
		min === undefined || max === undefined || step === undefined || width === 0
			? 0
			: (step / (max - min)) * width
	const style = useMemo(
		() => (gap >= 10 ? {backgroundSize: `${gap}px 100%`} : undefined),
		[gap]
	)

	return <div ref={element} className={styles.scales} style={style} />
}
