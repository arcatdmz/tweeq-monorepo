<script lang="ts" setup generic="T">
import {
	DRUM_DRAG_STEP_PX,
	advanceDrumDragIndex,
	clampDrumIndex,
	consumeDrumWheel,
	findDrumTypeAheadIndex,
	getDrumCellWidth,
	getDrumClickOffset,
} from '@tweeq/core'
import {useElementBounding, useResizeObserver} from '@vueuse/core'
import {computed, onBeforeUnmount, onMounted, ref, shallowRef, watch} from 'vue'

import {type InputEmits, useLabelizer} from '../types'
import {useDrag} from '../use/useDrag'
import type {InputDrumProps} from './types'

const props = defineProps<InputDrumProps<T>>()

const model = defineModel<T>({required: true})

const emit = defineEmits<InputEmits>()

const labelizer = useLabelizer(props)

const completeOptions = computed(() =>
	props.options.map(value => ({value, label: labelizer.value(value)}))
)

const activeIndex = computed(() =>
	props.options.findIndex(option => Object.is(option, model.value))
)

const disabled = computed(() => props.disabled ?? false)

const $root = shallowRef<HTMLElement | null>(null)
const {width: viewportWidth} = useElementBounding($root)

// Animate the slide whenever the bound VALUE changes — be it a user gesture
// (drag release, click, wheel, keys) or an external modelValue reassignment (see
// the watch below). Option-list and layout changes (and the initial mount) keep
// the value put, so they repositon instantly instead of sliding for no reason.
const animating = ref(false)
let animTimer: ReturnType<typeof setTimeout> | undefined
function triggerAnim() {
	animating.value = true
	clearTimeout(animTimer)
	animTimer = setTimeout(() => (animating.value = false), 250)
}

// Cell width = the widest label (measured off-screen, so it tracks font load and
// option changes), keeping every cell the same — evenly spaced — and wide enough
// for its content. The cellWidth prop overrides it.
const measuredWidth = ref(0)
// Label font-size in px, so the gap cap below can be expressed in em.
const emPx = ref(16)
const $measure = shallowRef<HTMLElement | null>(null)

function measure() {
	const m = $measure.value
	if (!m) return
	emPx.value = parseFloat(getComputedStyle(m).fontSize) || 16
	let max = 0
	for (const child of Array.from(m.children)) {
		max = Math.max(max, (child as HTMLElement).offsetWidth)
	}
	measuredWidth.value = max
}

onMounted(measure)
useResizeObserver($measure, measure)

const cellWidth = computed(() => {
	return getDrumCellWidth({
		cellWidth: props.cellWidth,
		measuredLabelWidth: measuredWidth.value,
		viewportWidth: viewportWidth.value,
		emPx: emPx.value,
	})
})

function clampIndex(i: number) {
	return clampDrumIndex(i, props.options.length)
}

function setIndex(i: number) {
	if (props.options.length === 0) return
	const next = props.options[clampIndex(i)]
	if (!Object.is(next, model.value)) {
		model.value = next
	}
}

// While dragging we track a fractional index so the drum follows the pointer
// smoothly; the bound value snaps to the nearest whole option as it crosses.
const floatIndex = ref(0)
let dragStartIndex = 0

const {dragging} = useDrag($root, {
	disabled,
	// Lock the pointer so a single drag can scrub the whole list even when the
	// drum sits at a screen edge: useDrag then advances by accumulated movementX
	// instead of the (clamped) cursor position. A click still steps via onClick.
	lockPointer: true,
	onDragStart() {
		dragStartIndex = activeIndex.value < 0 ? 0 : activeIndex.value
		floatIndex.value = dragStartIndex
	},
	onDrag(state) {
		// Grab-and-spin: dragging right reveals earlier (lower-index) options.
		// Accumulate this frame's movement and clamp each step (not the total
		// offset from pointerdown) — so dragging past an end builds up no hidden
		// overshoot and a reversal turns the drum back immediately.
		floatIndex.value = advanceDrumDragIndex(
			floatIndex.value,
			state.delta[0],
			props.options.length,
			DRUM_DRAG_STEP_PX
		)
		setIndex(Math.round(floatIndex.value))
	},
	onDragEnd() {
		// Animate the settle from the fractional drag position to the snapped value.
		triggerAnim()
		emit('confirm')
	},
	onClick(state) {
		// Tapping a peeking neighbour steps toward it.
		const root = $root.value
		if (!root) return
		const x = state.xy[0] - root.getBoundingClientRect().left
		const offset = getDrumClickOffset(
			x,
			viewportWidth.value,
			cellWidth.value
		)
		if (offset !== 0) {
			setIndex(activeIndex.value + offset)
		}
	},
})

const displayIndex = computed(() =>
	dragging.value ? floatIndex.value : Math.max(0, activeIndex.value)
)

// Animate slides driven from OUTSIDE too (the parent reassigning modelValue),
// not just the drum's own gestures. Keyed on the value — not the active index —
// so changing/reordering `options` while the value stays put still repositions
// instantly (the original intent). Skip while dragging, where the transform must
// track the pointer and the settle is animated by onDragEnd.
watch(model, () => {
	if (!dragging.value) triggerAnim()
})

const trackStyle = computed(() => ({
	transform: `translateX(${
		viewportWidth.value / 2 - cellWidth.value * (displayIndex.value + 0.5)
	}px)`,
	// Tween only on a value change (animating); never while dragging (it would
	// lag the pointer) or for option/layout repositioning.
	transition: dragging.value || !animating.value ? 'none' : undefined,
}))

// Wheel / trackpad: accumulate until a cell's worth of scroll, then step.
let wheelAccum = 0
function onWheel(e: WheelEvent) {
	if (disabled.value) return
	e.preventDefault()
	const consumed = consumeDrumWheel(wheelAccum, e.deltaX || e.deltaY)
	wheelAccum = consumed.remainder
	if (consumed.steps) setIndex(activeIndex.value + consumed.steps)
}

// Type-ahead: while focused, typing jumps to the option whose label starts with
// what's been typed ("A" → "Auto", "15" → "150"). Keystrokes accumulate into a
// buffer that resets after a short pause, so quick typing matches longer
// prefixes while a fresh keystroke later starts over.
let typeBuffer = ''
let typeTimer: ReturnType<typeof setTimeout> | undefined
// Returns whether the typed buffer matched an option, so the caller can let an
// unmatched key keep propagating to app-wide shortcuts.
function typeAhead(char: string): boolean {
	clearTimeout(typeTimer)
	typeTimer = setTimeout(() => (typeBuffer = ''), 800)
	typeBuffer += char.toLowerCase()
	const i = findDrumTypeAheadIndex(
		completeOptions.value.map(option => option.label),
		typeBuffer
	)
	if (i >= 0) {
		setIndex(i)
		return true
	}
	return false
}

function onKeyDown(e: KeyboardEvent) {
	if (disabled.value) return
	if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
		e.preventDefault()
		// Don't let the arrow bubble to global shortcuts (frame step etc.) — the
		// drum handled it.
		e.stopPropagation()
		setIndex(activeIndex.value - 1)
	} else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
		e.preventDefault()
		e.stopPropagation()
		setIndex(activeIndex.value + 1)
	} else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
		// A printable character — type-ahead. Only swallow it (stopPropagation) when
		// it actually matched an option; an unmatched key falls through to app-wide
		// single-key shortcuts as usual.
		if (typeAhead(e.key)) {
			e.stopPropagation()
		}
	}
}

onBeforeUnmount(() => {
	clearTimeout(animTimer)
	clearTimeout(typeTimer)
})
</script>

<template>
	<div
		ref="$root"
		class="TqInputDrum"
		:class="{disabled}"
		:style="{
			'--cell-width': cellWidth + 'px',
			'--label-width': measuredWidth + 'px',
		}"
		:inline-position="inlinePosition"
		:block-position="blockPosition"
		:aria-invalid="invalid || undefined"
		:tabindex="disabled ? -1 : 0"
		data-tq-component="input-drum"
		:data-tq-disabled="disabled ? '' : undefined"
		data-tq-part="root"
		@keydown="onKeyDown"
		@wheel="onWheel"
		@focus="emit('focus')"
		@blur="emit('blur')"
	>
		<!-- Centre ruler mark: a fixed, full-height line at the selection point.
			Before .viewport in the DOM so it paints behind the labels. -->
		<span class="center-mark" data-tq-part="center-mark" />
		<div class="viewport" data-tq-part="viewport">
			<div class="track" :style="trackStyle" data-tq-part="track">
				<div
					v-for="(op, i) in completeOptions"
					:key="`${op.label}-${i}`"
					class="cell"
					:class="{active: i === activeIndex, numeric: font === 'numeric'}"
					data-tq-cell=""
					:data-tq-active="i === activeIndex ? '' : undefined"
					:data-tq-numeric="font === 'numeric' ? '' : undefined"
					:data-tq-part="i === activeIndex ? 'active-cell' : 'cell'"
				>
					{{ op.label }}
					<span class="tick" data-tq-part="tick" />
				</div>
			</div>
		</div>
		<!-- Off-screen ruler: same font/padding as the cells, intrinsic width, so
			measuring the widest label drives the (uniform) cell width. -->
		<div ref="$measure" class="measure" data-tq-part="measure" aria-hidden="true">
			<span
				v-for="(op, i) in completeOptions"
				:key="`${op.label}-${i}`"
				:class="{numeric: font === 'numeric'}"
				data-tq-measure-item=""
				:data-tq-numeric="font === 'numeric' ? '' : undefined"
			>
				{{ op.label }}
			</span>
		</div>
	</div>
</template>
