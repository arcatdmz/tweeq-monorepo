import {resizeSplitPane} from '@tweeq/core'
import {type DragState} from '@tweeq/dom'
import {
	type CSSProperties,
	type HTMLAttributes,
	type ReactNode,
	useMemo,
	useRef,
} from 'react'

import {useConfigRef, useDrag} from '../../hooks'
import {useTweeqRuntime} from '../../runtime'

export interface PaneSplitProps extends HTMLAttributes<HTMLDivElement> {
	name: string
	direction: 'horizontal' | 'vertical'
	size?: number
	scroll?: readonly [boolean, boolean]
	fixed?: 'first' | 'second'
	min?: number
	first?: ReactNode
	second?: ReactNode
}

export function PaneSplit({
	name,
	direction,
	size: defaultSize = 50,
	scroll = [true, true],
	fixed,
	min = 40,
	first,
	second,
	className,
	style,
	...props
}: PaneSplitProps) {
	const {appConfigStore} = useTweeqRuntime()
	const root = useRef<HTMLDivElement>(null)
	const divider = useRef<HTMLDivElement>(null)
	const entry = useMemo(
		() =>
			appConfigStore
				.getState()
				.ref(fixed ? `${name}.px` : `${name}.width`, defaultSize),
		[appConfigStore, defaultSize, fixed, name]
	)
	const [size, setSize] = useConfigRef(entry)
	const startSize = useRef(size)
	const current = useRef({size, setSize, fixed, direction, min})
	current.current = {size, setSize, fixed, direction, min}
	const dragOptions = useMemo(
		() => ({
			dragDelaySeconds: 0,
			onDragStart: () => {
				startSize.current = current.current.size
			},
			onDrag: (drag: DragState) => {
				const state = current.current
				const delta =
					state.direction === 'horizontal'
						? drag.xy[0] - drag.initial[0]
						: drag.xy[1] - drag.initial[1]
				const bounds = root.current?.getBoundingClientRect()
				const viewportSize =
					state.direction === 'horizontal'
						? bounds?.width ?? 0
						: bounds?.height ?? 0
				state.setSize(
					resizeSplitPane({
						start: startSize.current,
						movement: delta,
						fixed: state.fixed,
						viewportSize,
						minPixelSize: state.min,
					})
				)
			},
		}),
		[]
	)
	useDrag(divider, dragOptions)
	const sizedPane = fixed ?? 'first'
	const dimension = direction === 'horizontal' ? 'width' : 'height'
	const sizeStyle = {[dimension]: `${size}${fixed ? 'px' : '%'}`}

	return (
		<div
			{...props}
			ref={root}
			className={className}
			style={{...style, '--pane-min': `${min}px`} as CSSProperties}
			data-tq-component="pane-split"
			data-tq-direction={direction}
			data-tq-fixed={fixed ? '' : undefined}
			data-tq-part="root"
		>
			<div
				style={sizedPane === 'first' ? sizeStyle : undefined}
				data-tq-part="first"
				data-tq-grow={sizedPane !== 'first' ? '' : undefined}
			>
				<div
					data-tq-part="wrapper"
					data-tq-scroll={scroll[0] ? '' : undefined}
				>
					{first}
				</div>
			</div>
			<div ref={divider} data-tq-part="divider" />
			<div
				style={sizedPane === 'second' ? sizeStyle : undefined}
				data-tq-part="second"
				data-tq-grow={sizedPane !== 'second' ? '' : undefined}
			>
				<div
					data-tq-part="wrapper"
					data-tq-scroll={scroll[1] ? '' : undefined}
				>
					{second}
				</div>
			</div>
		</div>
	)
}
