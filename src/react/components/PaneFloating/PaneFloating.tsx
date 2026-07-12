import {
	type CSSProperties,
	type HTMLAttributes,
	useEffect,
	useMemo,
	useRef,
} from 'react'

import {
	appConfigStore,
	type DragState,
	type FloatingPanePosition,
	resizeFloatingPane,
} from '../../../core'
import {classNames} from '../../classNames'
import {useConfigRef, useDrag, useWindowSize} from '../../hooks'
import {Icon} from '../Icon'
import styles from './PaneFloating.module.styl'

const DEFAULT_POSITION: FloatingPanePosition = {
	anchor: 'right-top',
	width: 400,
	height: 400,
}

export type PaneFloatingPosition = FloatingPanePosition

export interface PaneFloatingProps extends HTMLAttributes<HTMLDivElement> {
	name: string
	icon?: string
	position?: FloatingPanePosition
	onChangePosition?: (position: FloatingPanePosition) => void
}

export function PaneFloating({
	name,
	icon,
	position: defaultPosition = DEFAULT_POSITION,
	onChangePosition,
	children,
	className,
	style,
	...props
}: PaneFloatingProps) {
	const root = useRef<HTMLDivElement>(null)
	const top = useRef<HTMLDivElement>(null)
	const right = useRef<HTMLDivElement>(null)
	const bottom = useRef<HTMLDivElement>(null)
	const left = useRef<HTMLDivElement>(null)
	const windowSize = useWindowSize()
	const entry = useMemo(
		() => appConfigStore.getState().ref(`${name}.position`, defaultPosition),
		[defaultPosition, name]
	)
	const [position, setStoredPosition] = useConfigRef(entry)
	const positionRef = useRef(position)
	positionRef.current = position
	const callbacks = useRef({onChangePosition})
	callbacks.current = {onChangePosition}
	const startSize = useRef(0)
	const setPosition = (next: FloatingPanePosition) => {
		positionRef.current = next
		setStoredPosition(next)
		callbacks.current.onChangePosition?.(next)
	}
	const makeDragOptions = (axis: 'width' | 'height', edge: 'near' | 'far') => ({
		dragDelaySeconds: 0,
		onDragStart: () => {
			const rect = root.current?.getBoundingClientRect()
			startSize.current =
				axis === 'width' ? rect?.width ?? 0 : rect?.height ?? 0
		},
		onDrag: (drag: DragState) => {
			const delta =
				axis === 'width'
					? drag.xy[0] - drag.initial[0]
					: drag.xy[1] - drag.initial[1]
			const current = Math.round(
				startSize.current + delta * (edge === 'near' ? -1 : 1)
			)
			const titlebarHeight =
				Number.parseFloat(
					getComputedStyle(document.documentElement).getPropertyValue(
						'--titlebar-area-height'
					)
				) || 0
			setPosition(
				resizeFloatingPane({
					position: positionRef.current,
					axis,
					edge,
					current,
					viewport:
						axis === 'width'
							? window.innerWidth
							: window.innerHeight - titlebarHeight,
				})
			)
		},
	})
	useDrag(
		left,
		useMemo(() => makeDragOptions('width', 'near'), [])
	)
	useDrag(
		right,
		useMemo(() => makeDragOptions('width', 'far'), [])
	)
	useDrag(
		top,
		useMemo(() => makeDragOptions('height', 'near'), [])
	)
	useDrag(
		bottom,
		useMemo(() => makeDragOptions('height', 'far'), [])
	)

	useEffect(() => {
		let next = positionRef.current
		if (
			'width' in next &&
			typeof next.width === 'number' &&
			next.width > windowSize.width
		) {
			next = {...next, width: windowSize.width}
		}
		if (
			'height' in next &&
			typeof next.height === 'number' &&
			next.height > windowSize.height
		) {
			next = {...next, height: windowSize.height}
		}
		if (next !== positionRef.current) setPosition(next)
	}, [windowSize.height, windowSize.width])

	const hasWidth = 'width' in position
	const hasHeight = 'height' in position
	const rootStyle = {
		...style,
		width:
			hasWidth && typeof position.width === 'number'
				? `${position.width}px`
				: undefined,
		height:
			hasHeight && typeof position.height === 'number'
				? `${position.height}px`
				: undefined,
	} as CSSProperties
	const anchor = position.anchor

	return (
		<div
			{...props}
			ref={root}
			className={classNames(
				styles.pane,
				styles[`anchor-${anchor}`],
				hasWidth && position.width === 'minimized' && styles.widthMinimized,
				hasHeight && position.height === 'minimized' && styles.heightMinimized,
				className
			)}
			style={rootStyle}
		>
			<div ref={top} className={classNames(styles.resize, styles.top)} />
			<div ref={right} className={classNames(styles.resize, styles.right)} />
			<div ref={bottom} className={classNames(styles.resize, styles.bottom)} />
			<div ref={left} className={classNames(styles.resize, styles.left)} />
			{icon && <Icon className={styles.minimizedTitle} icon={icon} />}
			<div className={styles.wrapper}>
				<div className={styles.content}>{children}</div>
			</div>
		</div>
	)
}
