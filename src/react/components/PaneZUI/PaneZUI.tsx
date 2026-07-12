import * as Bndr from 'bndr-js'
import {mat2d, scalar, vec2} from 'linearly'
import {
	type CSSProperties,
	type HTMLAttributes,
	useEffect,
	useRef,
	useState,
} from 'react'

import {classNames} from '../../classNames'
import {useBndr, useElementBounding} from '../../hooks'
import styles from './PaneZUI.module.styl'

export type VisibleRect = readonly [vec2, vec2]

export interface PaneZUIProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
	transform?: mat2d
	onChangeTransform?: (transform: mat2d) => void
	onChangeVisibleRect?: (rect: VisibleRect) => void
	onChangeSize?: (size: vec2) => void
	background?: 'dots'
}

export function PaneZUI({
	transform,
	onChangeTransform,
	onChangeVisibleRect,
	onChangeSize,
	background,
	children,
	className,
	...props
}: PaneZUIProps) {
	const root = useRef<HTMLDivElement>(null)
	const bounds = useElementBounding(root)
	const [local, setLocal] = useState<mat2d>(() => transform ?? mat2d.I)
	const localRef = useRef(local)
	localRef.current = local
	const callback = useRef(onChangeTransform)
	callback.current = onChangeTransform

	useEffect(() => {
		if (transform && !mat2d.approx(transform, localRef.current))
			setLocal(transform)
	}, [transform])
	useEffect(() => {
		onChangeSize?.([bounds.width, bounds.height])
		const inverse = mat2d.inv(local) ?? mat2d.I
		onChangeVisibleRect?.([
			vec2.transformMat2d([0, 0], inverse),
			vec2.transformMat2d([bounds.width, bounds.height], inverse),
		])
	}, [bounds.height, bounds.width, local, onChangeSize, onChangeVisibleRect])

	useBndr(root, element => {
		const pointer = Bndr.pointer(element)
		const keyboard = Bndr.keyboard()
		const leftPressed = pointer.left.pressed({pointerCapture: true})
		const position = pointer.position({coordinate: 'offset'})
		const scroll = pointer.scroll({
			preventDefault: true,
			stopPropagation: true,
			capture: true,
		})
		const altPressed = keyboard.pressed('option')
		const panByDrag = pointer.middle
			.drag({pointerCapture: true})
			.map(data => data.delta)
		const panByScroll = scroll
			.map(([x, y]) => [-x, -y] as vec2)
			.while(altPressed.not(), false)
		const apply = (delta: mat2d) => {
			const next = mat2d.mul(delta, localRef.current)
			localRef.current = next
			setLocal(next)
			callback.current?.(next)
		}
		Bndr.combine(panByDrag, panByScroll).map(mat2d.fromTranslation).on(apply)
		const zoomByScroll = scroll.while(altPressed, false).map(([, y]) => -y)
		const zoomByPinch = pointer.pinch().map(value => -2 * value)
		const zoomOrigin = position.stash(
			Bndr.combine(
				leftPressed.down(),
				scroll.constant(true as const),
				zoomByPinch.constant(true as const)
			)
		)
		Bndr.combine(zoomByScroll, zoomByPinch)
			.map(delta =>
				mat2d.fromScaling([1.003 ** delta, 1.003 ** delta], zoomOrigin.value)
			)
			.on(apply)
	})

	const [a, , , d, tx, ty] = local
	const opacity = scalar.smoothstep(0.1, 0.4, (a + d) / 2)

	return (
		<div {...props} ref={root} className={classNames(styles.zui, className)}>
			{background === 'dots' && (
				<div
					className={styles.dots}
					style={{
						opacity,
						backgroundPosition: `${tx}px ${ty}px`,
						backgroundSize: `${20 * a}px ${20 * d}px`,
					}}
				/>
			)}
			<div
				className={styles.transform}
				style={{transform: `matrix(${local.join(',')})`} as CSSProperties}
			>
				{children}
			</div>
		</div>
	)
}
