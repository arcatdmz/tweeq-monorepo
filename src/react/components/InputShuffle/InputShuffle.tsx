import {type ButtonHTMLAttributes, useState} from 'react'

import {classNames} from '../../classNames'
import {Icon} from '../Icon'
import {SvgIcon} from '../SvgIcon'
import styles from './InputShuffle.module.styl'

export interface InputShuffleProps<T>
	extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value'> {
	value: T
	onChange?: (value: T) => void
	generate: (previous: T) => T
	icon?: string
}

export function InputShuffle<T>({
	value,
	onChange,
	generate,
	icon,
	className,
	onClick,
	...props
}: InputShuffleProps<T>) {
	const [rotation, setRotation] = useState(0)
	const [face, setFace] = useState(3)

	return (
		<button
			{...props}
			className={classNames(styles.tqInputShuffle, className)}
			onClick={event => {
				onClick?.(event)
				if (event.defaultPrevented) return
				setRotation(current => current + 90)
				setFace(Math.floor(Math.random() * 6) + 1)
				onChange?.(generate(value))
			}}
		>
			{icon ? (
				<Icon
					className={styles.icon}
					icon={icon}
					style={{transform: `rotate(${rotation}deg)`}}
				/>
			) : (
				<Dice face={face} rotation={rotation} />
			)}
		</button>
	)
}

function Dice({face, rotation}: {face: number; rotation: number}) {
	const dots: Record<number, [number, number][]> = {
		1: [[16, 16]],
		2: [
			[11, 21],
			[21, 11],
		],
		3: [
			[16, 16],
			[10, 22],
			[22, 10],
		],
		4: [
			[10, 22],
			[22, 10],
			[10, 10],
			[22, 22],
		],
		5: [
			[16, 16],
			[10, 22],
			[22, 10],
			[10, 10],
			[22, 22],
		],
		6: [
			[10, 10],
			[10, 16],
			[10, 22],
			[22, 10],
			[22, 16],
			[22, 22],
		],
	}

	return (
		<SvgIcon
			mode="block"
			className={styles.icon}
			style={{transform: `rotate(${rotation}deg)`}}
		>
			{dots[face].map(([cx, cy]) => (
				<circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1" />
			))}
			<path d="M24,29H8c-2.8,0-5-2.2-5-5V8c0-2.8,2.2-5,5-5h16c2.8,0,5,2.2,5,5v16C29,26.8,26.8,29,24,29z" />
		</SvgIcon>
	)
}
