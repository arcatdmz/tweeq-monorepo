<script setup lang="ts">
import {
	centerTimelineFrame,
	getTimelineScrollBounds,
	panTimelineRange,
	showTimelineRange,
	toPercent,
	zoomTimelineRange,
} from '@tweeq/core'
import {useElementBounding} from '@vueuse/core'
import {scalar, type vec2} from 'linearly'
import {
	computed,
	onBeforeUnmount,
	shallowRef,
	useTemplateRef,
	watch,
} from 'vue'

import type {TimelineProps} from './types'

const props = withDefaults(defineProps<TimelineProps>(), {
	frameWidth: 60,
	frameWidthRange: () => [10, 100],
	overscroll: 0.5,
})

defineSlots<{
	default(props: {
		range: vec2
		visibleFrameRange: vec2
		rangeStyle: (range: vec2 | number) => any
		offsetStyle: (offset: number) => any
	}): void
	scrollbarRight: void
}>()

const range = shallowRef<vec2>(props.frameRange ?? [0, 1])

const visibleFrameRange = computed<vec2>(() => {
	const [startFrame, endFrame] = props.frameRange
	const [start, end] = range.value
	return [
		Math.max(Math.floor(start), startFrame),
		Math.min(Math.ceil(end), endFrame),
	]
})

const emit = defineEmits<{
	'update:frameWidth': [number]
	/**
	 * Fired once the continuous frameWidth (zoom) change settles. Wheel-zoom has
	 * no natural pointer-up, so this is debounced. Consumers use it to close out a
	 * transaction opened on the first `update:frameWidth` (e.g. resuming autosave
	 * that was batched during the gesture).
	 */
	confirm: []
}>()

let confirmTimer: ReturnType<typeof setTimeout> | undefined
function scheduleConfirm() {
	clearTimeout(confirmTimer)
	confirmTimer = setTimeout(() => emit('confirm'), 300)
}
onBeforeUnmount(() => clearTimeout(confirmTimer))

const $root = useTemplateRef('$root')
const {width: containerWidth} = useElementBounding($root)

function onWheel(event: WheelEvent) {
	if (event.altKey) {
		const zoom = 1.003 ** event.deltaY
		const newFrameWidth = scalar.clamp(
			props.frameWidth * zoom,
			...props.frameWidthRange
		)
		const appliedZoom = newFrameWidth / props.frameWidth
		const rect = $root.value?.getBoundingClientRect()
		const x = rect ? event.clientX - rect.left : 0
		const origin = scalar.fit(
			x,
			0,
			containerWidth.value,
			range.value[0],
			range.value[1]
		)

		emit('update:frameWidth', newFrameWidth)
		scheduleConfirm()
		range.value = zoomTimelineRange(
			range.value,
			origin,
			appliedZoom,
			props.frameRange,
			props.overscroll
		)
	} else {
		range.value = panTimelineRange(
			range.value,
			event.deltaX || event.deltaY,
			props.frameWidth,
			props.frameRange,
			props.overscroll
		)
	}
}

const barStyles = computed(() => {
	const [start, end] = range.value
	const duration = end - start
	const [contentStart, contentEnd] = props.frameRange

	// Knob width = the visible fraction of the content (capped to the track).
	const width = Math.min(duration / (contentEnd - contentStart), 1)

	// The knob's CENTER tracks the scroll position across the full scrollable
	// travel: it sits at the track's left edge at the leftmost scroll and the
	// right edge at the rightmost, so the knob never runs off the track (only
	// its overhanging half is clipped at the extremes).
	const [minStart, maxStart] = getTimelineScrollBounds(
		props.frameRange,
		duration,
		props.overscroll
	)
	const center =
		minStart < maxStart ? scalar.invlerp(minStart, maxStart, start) : 0.5

	return {
		width: toPercent(width),
		left: toPercent(center - width / 2),
	}
})

watch(
	() => [containerWidth.value, props.frameWidth] as const,
	([w, ppu]) => {
		const [start] = range.value

		range.value = [start, start + w / ppu]
	}
)

function showRange(showRange: vec2 | number) {
	range.value = showTimelineRange(range.value, showRange)
}

/**
 * Scrolls so that the given frame sits at the horizontal center of the view,
 * keeping the current zoom (visible duration).
 */
function centerFrame(frame: number) {
	range.value = centerTimelineFrame(range.value, frame)
}

defineExpose({
	showRange,
	centerFrame,
})

function toOffset(frame: number) {
	return (frame - range.value[0]) * props.frameWidth
}

function rangeStyle(range: number | vec2) {
	const [start, end] = typeof range === 'number' ? [range, range + 1] : range

	const x = toOffset(start)
	const width = (end - start + 1) * props.frameWidth

	return {
		transform: `translateX(${x}px)`,
		width: `${width}px`,
	}
}

function offsetStyle(offset: number) {
	const x = toOffset(offset)

	return {
		transform: `translateX(${x}px)`,
	}
}
</script>

<template>
	<div class="TqTimeline" data-tq-component="timeline" data-tq-part="root">
		<div class="container" data-tq-part="container">
			<div
				ref="$root"
				class="fixed"
				data-tq-part="fixed"
				@wheel.prevent="onWheel"
			>
				<slot
					:range="range"
					:visibleFrameRange="visibleFrameRange"
					:rangeStyle="rangeStyle"
					:offsetStyle="offsetStyle"
				/>
			</div>
		</div>
		<div ref="$scrollbar" class="scrollbar" data-tq-part="scrollbar">
			<div ref="$knob" class="knob" :style="barStyles" data-tq-part="knob" />
			<slot name="scrollbarRight" />
		</div>
	</div>
</template>
