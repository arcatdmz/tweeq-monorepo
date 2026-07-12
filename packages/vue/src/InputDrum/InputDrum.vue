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
import {computed, onMounted, ref, shallowRef, watch} from 'vue'

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

const activeIndex = computed(() => props.options.indexOf(model.value))

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
	const next = props.options[clampIndex(i)]
	if (next !== undefined && !Object.is(next, model.value)) {
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
		data-tq-part="root"
		@keydown="onKeyDown"
		@wheel.prevent="onWheel"
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
					:key="op.label"
					class="cell"
					:class="{active: i === activeIndex, numeric: font === 'numeric'}"
					:data-tq-part="i === activeIndex ? 'active-cell' : 'cell'"
				>
					{{ op.label }}
					<span class="tick" />
				</div>
			</div>
		</div>
		<!-- Off-screen ruler: same font/padding as the cells, intrinsic width, so
			measuring the widest label drives the (uniform) cell width. -->
		<div ref="$measure" class="measure" aria-hidden="true">
			<span
				v-for="op in completeOptions"
				:key="op.label"
				:class="{numeric: font === 'numeric'}"
			>
				{{ op.label }}
			</span>
		</div>
	</div>
</template>

<style lang="stylus" scoped>

.TqInputDrum
	position relative
	// Fill the slot inside an InputGroup like the other fields; the track is
	// absolutely positioned, so keep a min-width (≈two labels: the centre value
	// plus a half-label peeking on each side) so it never collapses.
	flex-grow 1
	min-width calc(var(--label-width) * 2)
	height var(--tq-input-height)
	border-radius var(--tq-radius-input)
	background var(--tq-color-input)
	overflow hidden
	cursor ew-resize
	user-select none
	touch-action none
	hover-transition(background, box-shadow)
	use-input-position()

	&:hover
		background var(--tq-color-input-hover)

	// Keyboard focus only (a click/drag shouldn't flash the ring), matching the
	// other inputs' accent outline.
	&:focus-visible
		box-shadow 0 0 0 1px var(--tq-color-accent)
		outline none

	&.disabled
		opacity 0.5
		pointer-events none

// Clips + fades the strip here (not on the root) so the focus ring stays crisp.
// The fade band is a fixed width (≈one cell), not a percentage, so a wider drum
// keeps more crisp candidates in the middle and just fades the edges — several
// options peek past the centre instead of only one.
.viewport
	position absolute
	inset 0
	overflow hidden
	--fade calc(var(--cell-width) * 0.6)
	mask-image linear-gradient(to right, transparent, #000 var(--fade), #000 calc(100% - var(--fade)), transparent)
	-webkit-mask-image linear-gradient(to right, transparent, #000 var(--fade), #000 calc(100% - var(--fade)), transparent)

.track
	position absolute
	top 0
	left 0
	height 100%
	display flex
	align-items center
	will-change transform
	transition transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)

.cell
	position relative
	flex 0 0 auto
	width var(--cell-width)
	height 100%
	display flex
	align-items center
	justify-content center
	text-align center
	white-space nowrap
	border-radius var(--tq-radius-input)
	color var(--tq-color-text-subtle)
	hover-transition(color, background)

	&.numeric
		font-numeric()

	&.active
		color var(--tq-color-text)

	// Non-active values highlight on hover and show a pointer cursor: a click
	// jumps straight to that value (handled in onClick).
	&:not(.active)
		cursor pointer

		&:hover
			color var(--tq-color-text)
			background var(--tq-color-input-hover)

// Per-value ruler tick: faint, sits under each value and rides the track.
.tick
	position absolute
	bottom 2px
	left 50%
	transform translateX(-50%)
	width 1px
	height 3px
	border-radius 1px
	background var(--tq-color-text-subtle)
	opacity 0.5
	pointer-events none

// Fixed centre line at the selection point: spans the full height and runs
// behind the labels (it's before .viewport in the DOM). Outside .viewport so the
// mask never fades it.
.center-mark
	position absolute
	top 0
	bottom 0
	left 50%
	transform translateX(-50%)
	width 1px
	// The line runs behind the labels. Full accent reads fine on light text
	// (dark mode), but in light mode it shows through the dark centre label and
	// hurts legibility — soften it to the pale accent there only.
	background var(--tq-color-accent)
	pointer-events none

	[data-color-mode='light'] &
		background var(--tq-color-accent-soft)

// Hidden measuring row: never constrained, so each span is its natural width.
.measure
	position absolute
	top 0
	left 0
	visibility hidden
	pointer-events none
	display flex
	white-space nowrap

	span
		flex 0 0 auto
		// Breathing room added around the widest label to form the cell width.
		padding 0 0.6em

		&.numeric
			font-numeric()
</style>
