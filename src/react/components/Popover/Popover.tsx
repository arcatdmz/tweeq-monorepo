import {type vec2} from 'linearly'
import {
	type CSSProperties,
	type HTMLAttributes,
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import {createPortal} from 'react-dom'

import {
	addAnchorName,
	getPopoverGeometry,
	getPopoverPositionStyles,
	type PopoverOffset,
	type PopoverPlacement,
} from '../../../core'
import {classNames} from '../../classNames'
import {useEventListener, useResizeObserver} from '../../hooks'
import {Balloon} from '../Balloon'
import styles from './Popover.module.styl'

let instanceCount = 0

export interface PopoverProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'onToggle'> {
	reference: HTMLElement | null
	open: boolean
	placement?: PopoverPlacement | vec2
	offset?: PopoverOffset
	lightDismiss?: boolean
	arrow?: boolean
	flash?: boolean
	teleport?: string
	anchorName?: string
	exitTransition?: boolean
	onChangeOpen?: (open: boolean) => void
	onClose?: () => void
}

interface LayoutState {
	shiftX: number
	shiftY: number
	arrowSide?: 'top' | 'bottom' | 'left' | 'right'
	arrowOffset: number
}

const INITIAL_LAYOUT: LayoutState = {
	shiftX: 0,
	shiftY: 0,
	arrowOffset: 0,
}

export function Popover({
	reference,
	open,
	placement = 'bottom-start',
	offset = 0,
	lightDismiss = true,
	arrow = false,
	flash = false,
	teleport,
	anchorName: fixedAnchorName,
	exitTransition = false,
	onChangeOpen,
	onClose,
	className,
	style,
	children,
	...props
}: PopoverProps) {
	const popover = useRef<HTMLDivElement>(null)
	const [generatedAnchorName] = useState(
		() => `--tq-popover-${instanceCount++}`
	)
	const anchorName = fixedAnchorName ?? generatedAnchorName
	const [layout, setLayout] = useState<LayoutState>(INITIAL_LAYOUT)
	const layoutRef = useRef(layout)
	layoutRef.current = layout

	useLayoutEffect(() => {
		if (fixedAnchorName || !reference) return
		return addAnchorName(reference, anchorName)
	}, [anchorName, fixedAnchorName, reference])

	const update = useCallback(
		(resetShift = false) => {
			const element = popover.current
			if (!reference || !element || typeof placement !== 'string') return
			const current = resetShift ? INITIAL_LAYOUT : layoutRef.current
			const next = getPopoverGeometry({
				reference: reference.getBoundingClientRect(),
				popover: element.getBoundingClientRect(),
				placement,
				currentShiftX: current.shiftX,
				currentShiftY: current.shiftY,
				viewportWidth: document.documentElement.clientWidth,
				viewportHeight: document.documentElement.clientHeight,
				arrow,
			})
			layoutRef.current = next
			setLayout(previous =>
				previous.shiftX === next.shiftX &&
				previous.shiftY === next.shiftY &&
				previous.arrowSide === next.arrowSide &&
				previous.arrowOffset === next.arrowOffset
					? previous
					: next
			)
		},
		[arrow, placement, reference]
	)

	useLayoutEffect(() => {
		const element = popover.current
		if (!element) return
		let frame: number | undefined

		try {
			if (open) {
				if (!element.matches(':popover-open')) element.showPopover()
				layoutRef.current = INITIAL_LAYOUT
				setLayout(INITIAL_LAYOUT)
				update(true)
				frame = requestAnimationFrame(() => update())
			} else if (element.matches(':popover-open')) {
				element.hidePopover()
			}
		} catch {
			// Unsupported or already transitioned; content remains in DOM.
		}

		return () => {
			if (frame !== undefined) cancelAnimationFrame(frame)
		}
	}, [open, update])

	useEventListener<ToggleEvent>(popover, 'toggle', event => {
		const isOpen = event.newState === 'open'
		if (!isOpen) onClose?.()
		onChangeOpen?.(isOpen)
	})
	useEventListener<KeyboardEvent>(
		typeof window === 'undefined' ? null : window,
		'keydown',
		event => {
			if (event.key === 'Escape' && open && lightDismiss) {
				onClose?.()
				onChangeOpen?.(false)
			}
		}
	)
	useEventListener(
		typeof document === 'undefined' ? null : document,
		'scroll',
		() => update(),
		{capture: true, passive: true}
	)
	useEventListener(
		typeof window === 'undefined' ? null : window,
		'resize',
		() => update()
	)
	useResizeObserver(popover, () => update())

	const positionStyle = useMemo(
		() => getPopoverPositionStyles(placement, offset, anchorName),
		[anchorName, offset, placement]
	)
	const mergedStyle = {
		...positionStyle,
		...(layout.shiftX || layout.shiftY
			? {transform: `translate(${layout.shiftX}px, ${layout.shiftY}px)`}
			: {}),
		...style,
	} as CSSProperties

	if (!open && !exitTransition) return null

	const content = (
		<div
			{...props}
			ref={popover}
			className={classNames(
				styles.popover,
				exitTransition && styles.animateExit,
				className
			)}
			popover={lightDismiss ? 'auto' : 'manual'}
			style={mergedStyle}
		>
			{arrow ? (
				<Balloon
					arrowSide={layout.arrowSide}
					arrowOffset={layout.arrowOffset}
					flash={flash}
				>
					{children}
				</Balloon>
			) : (
				children
			)}
		</div>
	)

	if (!teleport || typeof document === 'undefined') return content
	const target = document.querySelector(teleport)
	return target ? createPortal(content, target) : content
}
