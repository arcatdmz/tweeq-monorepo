import {
	centerTimelineFrame,
	getTimelineScrollBounds,
	panTimelineRange,
	showTimelineRange,
	toPercent,
	zoomTimelineRange,
} from '@tweeq/core'
import {scalar, type vec2} from 'linearly'
import {
	type CSSProperties,
	forwardRef,
	type HTMLAttributes,
	type ReactNode,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
	type WheelEvent,
} from 'react'

import {classNames} from '../../classNames'
import {useElementBounding} from '../../hooks'

export interface TimelineRenderProps {
	range: vec2
	visibleFrameRange: vec2
	rangeStyle(range: vec2 | number): CSSProperties
	offsetStyle(offset: number): CSSProperties
}

export interface TimelineProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	frameRange: vec2
	frameWidth?: number
	onChangeFrameWidth?: (value: number) => void
	frameWidthRange?: vec2
	overscroll?: number
	onConfirm?: () => void
	children?: (props: TimelineRenderProps) => ReactNode
	renderScrollbarRight?: () => ReactNode
}

export interface TimelineHandle {
	showRange(range: vec2 | number): void
	centerFrame(frame: number): void
}

export const Timeline = forwardRef<TimelineHandle, TimelineProps>(
	function TimelineComponent(
		{
			frameRange,
			frameWidth = 60,
			onChangeFrameWidth,
			frameWidthRange = [10, 100],
			overscroll = 0.5,
			onConfirm,
			children,
			renderScrollbarRight,
			className,
			...props
		},
		forwardedRef
	) {
		const fixed = useRef<HTMLDivElement>(null)
		const {width: containerWidth} = useElementBounding(fixed)
		const [range, setRange] = useState<vec2>(frameRange)
		const confirmTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
			undefined
		)
		const stateRef = useRef({
			range,
			frameRange,
			frameWidth,
			frameWidthRange,
			overscroll,
		})
		stateRef.current = {
			range,
			frameRange,
			frameWidth,
			frameWidthRange,
			overscroll,
		}

		useEffect(() => {
			setRange(current => [
				current[0],
				current[0] + containerWidth / frameWidth,
			])
		}, [containerWidth, frameWidth])
		useEffect(() => () => clearTimeout(confirmTimer.current), [])

		useImperativeHandle(
			forwardedRef,
			() => ({
				showRange(shown) {
					setRange(current => showTimelineRange(current, shown))
				},
				centerFrame(frame) {
					setRange(current => centerTimelineFrame(current, frame))
				},
			}),
			[]
		)

		const visibleFrameRange: vec2 = [
			Math.max(Math.floor(range[0]), frameRange[0]),
			Math.min(Math.ceil(range[1]), frameRange[1]),
		]
		const toOffset = (frame: number) => (frame - range[0]) * frameWidth
		const rangeStyle = (shown: vec2 | number): CSSProperties => {
			const [start, end] =
				typeof shown === 'number' ? [shown, shown + 1] : shown
			return {
				transform: `translateX(${toOffset(start)}px)`,
				width: `${(end - start + 1) * frameWidth}px`,
			}
		}
		const offsetStyle = (offset: number): CSSProperties => ({
			transform: `translateX(${toOffset(offset)}px)`,
		})

		const barStyle = useMemo(() => {
			const duration = range[1] - range[0]
			const contentDuration = frameRange[1] - frameRange[0]
			const width = Math.min(duration / contentDuration, 1)
			const [minStart, maxStart] = getTimelineScrollBounds(
				frameRange,
				duration,
				overscroll
			)
			const center =
				minStart < maxStart ? scalar.invlerp(minStart, maxStart, range[0]) : 0.5
			return {width: toPercent(width), left: toPercent(center - width / 2)}
		}, [frameRange, overscroll, range])

		const onWheel = (event: WheelEvent<HTMLDivElement>) => {
			event.preventDefault()
			const current = stateRef.current
			if (event.altKey) {
				const zoom = 1.003 ** event.deltaY
				const nextWidth = Math.max(
					current.frameWidthRange[0],
					Math.min(current.frameWidthRange[1], current.frameWidth * zoom)
				)
				const appliedZoom = nextWidth / current.frameWidth
				const rect = fixed.current?.getBoundingClientRect()
				const x = rect ? event.clientX - rect.left : 0
				const origin = scalar.fit(
					x,
					0,
					containerWidth,
					current.range[0],
					current.range[1]
				)
				onChangeFrameWidth?.(nextWidth)
				clearTimeout(confirmTimer.current)
				confirmTimer.current = setTimeout(() => onConfirm?.(), 300)
				setRange(
					zoomTimelineRange(
						current.range,
						origin,
						appliedZoom,
						current.frameRange,
						current.overscroll
					)
				)
			} else {
				setRange(
					panTimelineRange(
						current.range,
						event.deltaX || event.deltaY,
						current.frameWidth,
						current.frameRange,
						current.overscroll
					)
				)
			}
		}

		return (
			<div
				{...props}
				className={classNames('TqTimeline', className)}
				data-tq-component="timeline"
				data-tq-part="root"
			>
				<div data-tq-part="container">
					<div
						ref={fixed}
						onWheel={onWheel}
						data-tq-part="fixed"
					>
						{children?.({range, visibleFrameRange, rangeStyle, offsetStyle})}
					</div>
				</div>
				<div data-tq-part="scrollbar">
					<div style={barStyle} data-tq-part="knob" />
					{renderScrollbarRight?.()}
				</div>
			</div>
		)
	}
)
