import {getZuiDotState, getZuiVisibleRect} from '@tweeq/core'
import {bindZuiGestures} from '@tweeq/dom'
import {mat2d, type vec2} from 'linearly'
import {
	type CSSProperties,
	type HTMLAttributes,
	useEffect,
	useRef,
	useState,
} from 'react'

import {useBndr, useElementBounding} from '../../hooks'

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
		onChangeVisibleRect?.(getZuiVisibleRect(local, [bounds.width, bounds.height]))
	}, [bounds.height, bounds.width, local, onChangeSize, onChangeVisibleRect])

	useBndr(root, element => {
		const apply = (delta: mat2d) => {
			const next = mat2d.mul(delta, localRef.current)
			localRef.current = next
			setLocal(next)
			callback.current?.(next)
		}
		bindZuiGestures(element, apply)
	})

	const dots = getZuiDotState(local)

	return (
		<div
			{...props}
			ref={root}
			className={className}
			data-tq-component="pane-zui"
			data-tq-part="root"
		>
			{background === 'dots' && (
				<div
					data-tq-part="dots"
					style={{
						opacity: dots.opacity,
						backgroundPosition: `${dots.position[0]}px ${dots.position[1]}px`,
						backgroundSize: `${dots.size[0]}px ${dots.size[1]}px`,
					}}
				/>
			)}
			<div
				data-tq-part="transform"
				style={{transform: `matrix(${local.join(',')})`} as CSSProperties}
			>
				{children}
			</div>
		</div>
	)
}
