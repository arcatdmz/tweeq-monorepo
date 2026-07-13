<script lang="ts" setup generic="T">
import {useElementBounding, useWindowSize, whenever} from '@vueuse/core'
import {search} from 'fast-fuzzy'
import {getDropdownNextOption, getLabelizer} from '@tweeq/core'
import {scalar, type vec2} from 'linearly'
import {
	computed,
	nextTick,
	onBeforeUnmount,
	type Ref,
	ref,
	useTemplateRef,
	watch,
} from 'vue'

import {Icon} from '../Icon'
import {InputString} from '../InputString'
import {Popover} from '../Popover'
import {useThemeStore} from '../stores/theme'
import {type InputEmits} from '../types'
import type {InputDropdownProps} from './types'

const model = defineModel<T>({required: true})

const props = withDefaults(defineProps<InputDropdownProps<T>>(), {
	prefix: '',
	suffix: '',
	align: 'center',
})

const labelizer = computed(() => getLabelizer(props))

const emit = defineEmits<InputEmits>()

defineOptions({
	inheritAttrs: false,
})

const open = ref(false)
const $root = useTemplateRef('$root')
const $input = useTemplateRef('$input')
const $select = useTemplateRef<HTMLUListElement>('$select')

const rootBound = useElementBounding($root)
const {height: windowHeight} = useWindowSize()

// Whether the cropped list has more content above / below the visible window.
const canScrollUp = ref(false)
const canScrollDown = ref(false)

// Gap kept from the viewport edges; the .select's own margin+border above the
// first option; auto-scroll speed (px/frame) while hovering an arrow.
const VIEWPORT_MARGIN = 6
const SELECT_CHROME = 2
const AUTO_SCROLL_SPEED = 8

const display = ref(labelizer.value(model.value))
const displayEdited = ref(false)

watch(
	() => [open.value, model.value] as const,
	([open, modelValue]) => {
		if (open) return
		display.value = labelizer.value(modelValue)
		displayEdited.value = false
	}
)

const valueAtStart = ref(model.value) as Ref<T>

// Icon of the currently selected option, shown next to the label in the resting
// field (not while typing to filter — then the field is a plain text box).
const currentIcon = computed(() => {
	if (!props.icons) return undefined
	const i = props.options.indexOf(model.value)
	return i >= 0 ? props.icons[i] : undefined
})

const showValueIcon = computed(() => !!currentIcon.value && !displayEdited.value)

// Label paired with currentIcon — keyed on the model (not `display`, which stays
// frozen while the popup is open) so icon and label always show the same option,
// even while hovering options.
const valueLabel = computed(() => labelizer.value(model.value))

const filteredOptions = computed(() => {
	if (display.value === '' || !displayEdited.value) return props.options

	const ret = search(display.value, props.options as any[], {
		keySelector: labelizer.value,
	}) as T[]

	return ret
})

const theme = useThemeStore()

// Real rendered height of the list, measured after open (scrollHeight). Falls
// back to an estimate for the first frame. Drives the fit/scroll decision so a
// wrong estimate can't push the box (and its bottom arrow) off-screen.
const listHeightPx = ref(0)

// Screen-Y of the popover's top edge (not-editing case). Starts so the selected
// option sits on the input; the down-arrow then nudges it upward to grow the
// menu into the empty space above — macOS-style — until it fills the viewport.
// A mutable ref (not a pure computed) because the auto-scroll moves it.
const dropdownTop = ref(VIEWPORT_MARGIN)

function initDropdownTop() {
	const itemH = theme.inputHeight
	const margin = VIEWPORT_MARGIN

	let index = props.options.indexOf(valueAtStart.value)
	if (index === -1) index = 0

	// Top that puts the selected option on the input (index 0 sits this far up).
	const anchorTop = rootBound.top.value - 2
	const idealTop = anchorTop - SELECT_CHROME - index * itemH

	const listHeight =
		listHeightPx.value || props.options.length * itemH + SELECT_CHROME * 2
	const available = windowHeight.value - margin * 2

	// Fits → cap so the whole list stays on screen (no cropping). Taller → keep
	// at least one row visible; the box still reaches the bottom edge (via
	// selectMaxHeight) and the down-arrow grows it upward from here.
	const maxTop =
		listHeight <= available
			? windowHeight.value - margin - listHeight
			: windowHeight.value - margin - itemH

	dropdownTop.value = scalar.clamp(idealTop, margin, Math.max(margin, maxTop))
}

const popoverPlacement = computed<vec2 | 'bottom'>(() => {
	// 2px === border width + focus outline
	const left = rootBound.left.value - 2

	// While typing to filter, just drop the (usually short) list below the input.
	if (displayEdited.value) {
		return [left, rootBound.bottom.value]
	}

	return [left, dropdownTop.value]
})

// Reach the bottom edge of the viewport, but never taller than the list itself.
// Tied to dropdownTop, so as the down-arrow raises the top the box grows and
// the bottom arrow disappears once everything fits.
const selectMaxHeight = computed(() => {
	const top = displayEdited.value ? rootBound.bottom.value : dropdownTop.value
	return Math.min(
		listHeightPx.value || Infinity,
		windowHeight.value - top - VIEWPORT_MARGIN
	)
})

watch(filteredOptions, filteredOptions => {
	if (filteredOptions.length > 0 && !filteredOptions.includes(model.value)) {
		model.value = filteredOptions[0]
	}
	if (!open.value) return
	nextTick(() => {
		measureList()
		// Snap to the top ONLY when the user narrowed the list by typing. An
		// external options change (e.g. the camera reporting new settable values
		// right after a hover-select) must keep the current scroll position —
		// otherwise the popup yanks back to the top mid-interaction.
		if (displayEdited.value && $select.value) {
			$select.value.scrollTop = 0
		}
		updateScrollArrows()
	})
})

let timeAtOpen: number | null = null

whenever(open, () => {
	valueAtStart.value = model.value
	timeAtOpen = new Date().getTime()
	window.addEventListener('pointerup', onPointerupWhileOpen)
	// Provisional placement (last measured height), then once rendered re-measure
	// for an exact layout and scroll the selected option onto the input.
	initDropdownTop()
	nextTick(() => {
		measureList()
		initDropdownTop()
		requestAnimationFrame(alignCurrentToTrigger)
	})
})

watch(open, isOpen => {
	if (!isOpen) stopAutoScroll()
})

function measureList() {
	if ($select.value) listHeightPx.value = $select.value.scrollHeight
}

// Scroll the cropped list so the option open with (`.current`) lands on the
// input. scrollTop is clamped by the browser, so near the list ends the
// selection simply stops at the edge (matching native menus).
function alignCurrentToTrigger() {
	const select = $select.value
	if (!select) return
	select.scrollTop = 0
	const current = select.querySelector<HTMLElement>('[data-tq-current]')
	if (current) {
		const delta = current.getBoundingClientRect().top - (rootBound.top.value - 2)
		select.scrollTop = Math.max(0, delta)
	}
	updateScrollArrows()
}

function updateScrollArrows() {
	const s = $select.value
	if (!s) {
		canScrollUp.value = canScrollDown.value = false
		return
	}
	// Visible height of the box (grows as the down-arrow raises dropdownTop).
	// Formula-based off the reactive selectMaxHeight so it has no reflow lag.
	const visible = Math.min(s.scrollHeight, selectMaxHeight.value)
	canScrollUp.value = s.scrollTop > 0.5
	canScrollDown.value = s.scrollTop + visible < s.scrollHeight - 0.5
}

// Keep the highlighted option visible during keyboard navigation.
function scrollActiveIntoView() {
	$select.value
		?.querySelector<HTMLElement>('[data-tq-active]')
		?.scrollIntoView({block: 'nearest'})
	updateScrollArrows()
}

let autoScrollRAF: number | null = null

function startAutoScroll(dir: -1 | 1) {
	stopAutoScroll()
	const step = () => {
		const s = $select.value
		if (!s) return stopAutoScroll()

		if (dir > 0) {
			// Reveal more below: first grow the menu upward into the empty space
			// above (macOS-style), and only scroll the content once it has filled
			// the viewport.
			if (dropdownTop.value > VIEWPORT_MARGIN) {
				dropdownTop.value = Math.max(
					VIEWPORT_MARGIN,
					dropdownTop.value - AUTO_SCROLL_SPEED
				)
			} else {
				s.scrollTop += AUTO_SCROLL_SPEED
			}
		} else {
			s.scrollTop -= AUTO_SCROLL_SPEED
		}

		updateScrollArrows()
		const atEnd = dir < 0 ? !canScrollUp.value : !canScrollDown.value
		if (atEnd) return stopAutoScroll()
		autoScrollRAF = requestAnimationFrame(step)
	}
	autoScrollRAF = requestAnimationFrame(step)
}

function stopAutoScroll() {
	if (autoScrollRAF !== null) cancelAnimationFrame(autoScrollRAF)
	autoScrollRAF = null
}

// Wheel anywhere in the popup. Mirrors the chevron logic so wheeling and the
// arrows agree: grow the menu upward while there's room above, then scroll. Also
// keeps the wheel from falling through to the page when it lands on an arrow.
function onWheel(e: WheelEvent) {
	const s = $select.value
	if (!s) return

	const dy = e.deltaY * (e.deltaMode === 1 ? theme.inputHeight : 1)

	// Scrolling down with empty space above AND clipped content below → grow into
	// the space first, spill the rest into a content scroll. (The "clipped below"
	// guard stops a fully-visible list from drifting up off the input.)
	const visible = Math.min(s.scrollHeight, selectMaxHeight.value)
	const moreBelow = s.scrollTop + visible < s.scrollHeight - 0.5
	if (dy > 0 && dropdownTop.value > VIEWPORT_MARGIN && moreBelow) {
		e.preventDefault()
		const grow = Math.min(dy, dropdownTop.value - VIEWPORT_MARGIN)
		dropdownTop.value -= grow
		s.scrollTop += dy - grow
		updateScrollArrows()
		return
	}

	// Over an arrow (not the scroller itself): scroll the list manually so the
	// wheel doesn't scroll the page behind the popup.
	if (!s.contains(e.target as Node)) {
		e.preventDefault()
		s.scrollTop += dy
		updateScrollArrows()
	}
	// Otherwise let .select scroll natively (overscroll-behavior: contain stops
	// it chaining to the page); @scroll refreshes the arrows.
}

function onSelect(option: T) {
	model.value = option
}

function onClickOption(option: T) {
	model.value = option
	open.value = false
	window.removeEventListener('pointerup', onPointerupWhileOpen)
	emit('confirm')
}

function onPointerupWhileOpen() {
	const elapsedFromOpen = new Date().getTime() - (timeAtOpen ?? 0)

	if (elapsedFromOpen > 500) {
		open.value = false
		emit('confirm')
		emit('blur')
		window.removeEventListener('pointerup', onPointerupWhileOpen)
	} else {
		$input.value?.select()
	}
}

function onPressArrow(isUp: boolean) {
	const option = getDropdownNextOption(
		filteredOptions.value,
		model.value,
		isUp ? -1 : 1
	)
	if (option === undefined) return
	model.value = option
	nextTick(scrollActiveIntoView)
}

// Enter confirms: while open (typically after typing to filter) close the
// popup and commit. Closing fires the open→false watch, which completes the
// field back to the selected option's full label. While closed, Enter just
// opens the popup.
function onEnter() {
	if (!open.value) {
		open.value = true
		return
	}

	open.value = false
	// Drop the outside-pointerup guard so a later click doesn't re-confirm.
	window.removeEventListener('pointerup', onPointerupWhileOpen)
	emit('confirm')
	// Blur the field: while focused the inner InputString keeps showing the typed
	// partial; dropping focus lets it settle to the selected option's full label
	// (the same reason clicking an option completes it).
	$input.value?.blur()
}

function onInputPointerdown(e: PointerEvent) {
	if (e.isPrimary) {
		open.value = true
	}
}

function onInputStringFocus() {
	open.value = true
	emit('focus')
}

function onInputStringUpdate(value: string) {
	display.value = value

	displayEdited.value = true
	open.value = true
}

function onInputStringBlur() {
	if (!open.value) {
		emit('blur')
	}
}

// When the popover is closed by pressing Esc, revert to the value at the start
function onPopoverUpdateOpen(_open: boolean) {
	if (!_open) {
		open.value = false
		window.removeEventListener('pointerup', onPointerupWhileOpen)
		model.value = valueAtStart.value
	}
}

function onEscape() {
	open.value = false
	window.removeEventListener('pointerup', onPointerupWhileOpen)
	model.value = valueAtStart.value
}

onBeforeUnmount(() => {
	window.removeEventListener('pointerup', onPointerupWhileOpen)
	stopAutoScroll()
})
</script>

<template>
	<div
		ref="$root"
		class="TqInputDropdown"
		:class="{open}"
		v-bind="$attrs"
		:align="align"
		:aria-disabled="disabled || undefined"
		data-tq-component="input-dropdown"
		:data-tq-open="open ? '' : undefined"
		data-tq-part="root"
	>
		<InputString
			ref="$input"
			:modelValue="display"
			class="field"
			:class="{'hide-text': showValueIcon}"
			data-tq-dropdown-field=""
			:data-tq-hide-text="showValueIcon ? '' : undefined"
			:theme="props.theme"
			:font="font"
			:align="align"
			:inline-position="inlinePosition"
			:block-position="blockPosition"
			:disabled="disabled"
			:invalid="invalid"
			@update:modelValue="onInputStringUpdate"
			@pointerdown="onInputPointerdown"
			@focus="onInputStringFocus"
			@blur="onInputStringBlur"
			@keydown.enter.prevent="onEnter"
			@keydown.up.prevent="onPressArrow(true)"
			@keydown.down.prevent="onPressArrow(false)"
			@keydown.esc="onEscape"
		/>
		<!-- Resting overlay: the selected option's icon beside its label, centred
			like the options list. Hidden while typing to filter; pointer-events none
			so clicks still reach the field beneath. -->
		<div
			v-if="showValueIcon"
			class="value-display"
			:class="{numeric: font === 'numeric'}"
			data-tq-part="value-display"
			:data-tq-numeric="font === 'numeric' ? '' : undefined"
		>
			<Icon class="value-icon" data-tq-part="value-icon" :icon="currentIcon!" />
			<span class="value-label" data-tq-part="value-label">{{ valueLabel }}</span>
		</div>
		<Icon class="chevron" data-tq-part="chevron" icon="mdi:unfold-more-horizontal" />
		<Popover
			:open="open"
			:reference="$root"
			:placement="popoverPlacement"
			:lightDismiss="false"
			@update:open="onPopoverUpdateOpen"
		>
			<div
				class="select-wrapper"
				data-tq-component="input-dropdown-list"
				data-tq-part="select-wrapper"
				:style="{width: rootBound.width.value + 2 + 'px'}"
				@wheel="onWheel"
			>
				<ul
					ref="$select"
					class="select"
					:style="{maxHeight: selectMaxHeight + 'px'}"
					:font="font"
					:align="align"
					role="listbox"
					data-tq-part="listbox"
					@scroll="updateScrollArrows"
				>
					<li
						v-for="(item, index) in filteredOptions"
						:key="index"
						class="option"
						role="option"
						:aria-selected="Object.is(item, modelValue)"
						:data-tq-part="`option-${index}`"
						data-tq-option=""
						:data-tq-active="Object.is(item, modelValue) ? '' : undefined"
						:data-tq-current="
							Object.is(item, valueAtStart) ? '' : undefined
						"
						:class="{
							active: Object.is(item, modelValue),
							current: Object.is(item, valueAtStart),
						}"
						@pointerenter="onSelect(item)"
						@click="onClickOption(item)"
					>
						<slot name="option" :item="item">
							<Icon
								v-if="icons && icons[options.indexOf(item)]"
								class="option-icon"
								data-tq-part="option-icon"
								:icon="icons[options.indexOf(item)]"
							/>
							{{ labelizer(item) }}
						</slot>
					</li>
				</ul>
				<div
					v-if="canScrollUp"
					class="scroll-arrow top"
					data-tq-part="scroll-arrow"
					data-tq-direction="top"
					@pointerenter="startAutoScroll(-1)"
					@pointerleave="stopAutoScroll"
					@pointerup.stop
				>
					<Icon icon="mdi:chevron-up" />
				</div>
				<div
					v-if="canScrollDown"
					class="scroll-arrow bottom"
					data-tq-part="scroll-arrow"
					data-tq-direction="bottom"
					@pointerenter="startAutoScroll(1)"
					@pointerleave="stopAutoScroll"
					@pointerup.stop
				>
					<Icon icon="mdi:chevron-down" />
				</div>
			</div>
		</Popover>
	</div>
</template>
