import {type DragState, multiSelectStore} from '@tweeq/dom'
import {type vec2} from 'linearly'
import {useEffect, useMemo, useRef} from 'react'

import {classNames} from '../../classNames'
import {useDrag, useKeys} from '../../hooks'
import {IconIndicator} from '../IconIndicator'
import styles from './MultiSelectPopup.module.styl'

const PAD_KEYS = ['x', 'y', '1', '2'] as const

export interface MultiSelectPadProps {
	type: 'slider' | 'pad'
	update:
		| ((delta: number) => (values: number[]) => number[])
		| ((delta: vec2) => (values: number[]) => number[])
	icon: string
}

export function MultiSelectPad({type, update, icon}: MultiSelectPadProps) {
	const root = useRef<HTMLDivElement>(null)
	const keys = useKeys(PAD_KEYS)
	const keysRef = useRef(keys)
	keysRef.current = keys
	const updateRef = useRef(update)
	updateRef.current = update
	const typeRef = useRef(type)
	typeRef.current = type
	const origin = useRef<vec2>([0, 0])
	const previousConstraint = useRef(false)

	const options = useMemo(
		() => ({
			lockPointer: true,
			onDragStart(state: DragState) {
				multiSelectStore.getState().captureValues()
				origin.current = state.xy
			},
			onDrag(state: DragState) {
				let delta: vec2 = [
					state.xy[0] - origin.current[0],
					state.xy[1] - origin.current[1],
				]
				if (typeRef.current === 'slider') {
					const apply = (updateRef.current as MultiSelectPadProps['update'])(
						delta[0] as never
					)
					multiSelectStore.getState().updateValues(apply)
				} else {
					if (keysRef.current.x || keysRef.current['1']) delta = [delta[0], 0]
					else if (keysRef.current.y || keysRef.current['2'])
						delta = [0, delta[1]]
					const apply = (
						updateRef.current as (delta: vec2) => (values: number[]) => number[]
					)(delta)
					multiSelectStore.getState().updateValues(apply)
				}
			},
			onDragEnd() {
				multiSelectStore.getState().confirmValues()
			},
		}),
		[]
	)
	const drag = useDrag(root, options)

	useEffect(() => {
		const constrained = keys.x || keys.y || keys['1'] || keys['2']
		if (constrained && !previousConstraint.current) {
			multiSelectStore.getState().captureValues()
			origin.current = drag.xy
		}
		previousConstraint.current = constrained
	}, [drag.xy, keys])

	return (
		<div
			ref={root}
			className={classNames(
				styles.pad,
				type === 'slider' && styles.slider,
				type === 'pad' && styles.pad2d
			)}
			data-tq-part="pad"
		>
			<IconIndicator icon={icon} active={drag.dragging} />
		</div>
	)
}
