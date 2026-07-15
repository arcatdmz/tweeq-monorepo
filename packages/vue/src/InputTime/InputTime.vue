<script setup lang="ts">
import {
	compileTimeExpression,
	formatTimecode,
	mergeSvgPaths,
	quantizeTimeTweakValue,
	svgLine,
} from '@tweeq/core'
import {useElementBounding, useMagicKeys} from '@vueuse/core'
import {scalar, vec2} from 'linearly'
import {range} from 'lodash-es'
import {
	computed,
	nextTick,
	onBeforeUnmount,
	ref,
	useTemplateRef,
	watch,
	watchSyncEffect,
} from 'vue'

import {InputTextBase} from '../InputTextBase'
import {type MenuItem} from '../Menu'
import {useMultiSelectStore} from '../stores/multiSelect'
import {Tooltip} from '../Tooltip'
import {TweakOverlay} from '../TweakOverlay'
import {InputEmits} from '../types'
import {useDrag} from '../use/useDrag'
import {InputTimeProps, TimeFormat} from './types'
import {useInputTimeContext} from './context'

const model = defineModel<number>({required: true})

const props = withDefaults(defineProps<InputTimeProps>(), {
	frameRate: 24,
	min: -Infinity,
	max: Infinity,
})

const emit = defineEmits<InputEmits>()

const context = useInputTimeContext()

const focused = ref(false)

const $input = useTemplateRef('$input')

// The tweak overlay renders in the browser top layer (a full-viewport popover),
// so it can't centre on the input with CSS percentages — that would centre it on
// the viewport. Position it at the input's viewport-space centre instead.
const inputBounds = useElementBounding($input as any)
const overlayStyle = computed(() => ({
	left: `${inputBounds.x.value + inputBounds.width.value / 2}px`,
	top: `${inputBounds.y.value + inputBounds.height.value / 2}px`,
}))

//------------------------------------------------------------------------------
// Tweak

const {
	q: doSnap,
	shift: increaseTweakScale,
	alt: decreaseTweakScale,
	h: forceHourTweak,
	m: forceMinuteTweak,
	s: forceSecondTweak,
	t: forceFrameTweak,
} = useMagicKeys()

const tweakScaleByHover = ref<number>(0)
const tweakScaleOffset = computed(() => {
	if (increaseTweakScale.value) return 1
	if (decreaseTweakScale.value) return -1
	return 0
})
const tweakScale = computed(() => {
	if (forceFrameTweak.value) return 0
	if (forceSecondTweak.value) return 1
	if (forceMinuteTweak.value) return 2
	if (forceHourTweak.value) return 3

	return scalar.clamp(tweakScaleByHover.value + tweakScaleOffset.value, 0, 3)
})

const tweakSpeed = computed(() => {
	const scale = tweakScale.value
	const fps = props.frameRate

	if (scale <= 0) return 1 / 4 // frames
	if (scale === 1) return fps / 10 // seconds
	if (scale === 2) return (fps * 60) / 10 // minutes
	return (fps * 60 * 60) / 100 // hours
})

const tweakLocal = ref(0)
let tweakAccumlated = 0

const {dragging: tweaking} = useDrag($input, {
	disabled: computed(() => props.disabled),
	lockPointer: true,
	onClick(_, e) {
		const digit = (e.target as Element | null)?.closest<HTMLElement>(
			'[data-tq-time-digit]'
		)
		if (!digit) {
			$input.value!.select()
		} else {
			const digitsInOrder = digits.value!.toReversed()
			const len = digitsInOrder.length
			const reverseIndex = Number(digit.dataset.tqDigitIndex)
			const i = len - reverseIndex - 1
			const str = digitsInOrder.slice(0, i).join(':')

			const start = str.length === 0 ? 0 : str.length + 1
			const width = digitsInOrder[i].length

			$input.value!.select(start, start + width)
		}
	},
	onDragStart() {
		tweakLocal.value = model.value
		tweakAccumlated = 0
		multi.capture()
		emit('focus')
	},
	onDrag({delta: [dx]}) {
		tweakLocal.value = scalar.clamp(
			tweakLocal.value + dx * tweakSpeed.value,
			props.min,
			props.max
		)
		tweakAccumlated += dx
		multi.update(x => x + tweakAccumlated)
	},
	onDragEnd() {
		emit('confirm')
		multi.confirm()
		emit('blur')
	},
})

watch(
	doSnap,
	(curt, prev) => {
		if (!curt && prev) {
			tweakLocal.value = model.value
		}
	},
	{flush: 'sync'}
)

watchSyncEffect(() => {
	const value = scalar.clamp(
		quantizeTimeTweakValue(
			tweakLocal.value,
			props.frameRate,
			tweakScale.value,
			doSnap.value,
			model.value
		),
		props.min,
		props.max
	)

	if (tweaking.value) {
		model.value = value
	}
})

//------------------------------------------------------------------------------
// Multi Select

const multi = useMultiSelectStore().register({
	type: 'number',
	el: $input,
	focusing: computed(() => focused.value || tweaking.value),
	getValue: () => model.value,
	setValue(value) {
		model.value = scalar.clamp(value, props.min, props.max)
	},
	confirm() {
		emit('confirm')
	},
})

const overlayMounted = ref(false)
const overlayLeaving = ref(false)
let overlayLeavingTimeout: ReturnType<typeof setTimeout> | undefined

function finishOverlayLeave() {
	overlayLeavingTimeout = undefined
	overlayMounted.value = false
	overlayLeaving.value = false
}

watch(tweaking, active => {
	if (active) {
		clearTimeout(overlayLeavingTimeout)
		overlayMounted.value = true
		overlayLeaving.value = false
		return
	}
	if (!overlayMounted.value) return

	overlayLeaving.value = true
	overlayLeavingTimeout = setTimeout(finishOverlayLeave, 200)
})

onBeforeUnmount(() => clearTimeout(overlayLeavingTimeout))

//------------------------------------------------------------------------------
// State management

function print(model: number, format: TimeFormat) {
	if (format === 'frames') {
		return model + 'F'
	}

	return formatTimecode(model, props.frameRate)
}

const display = ref('')

// Model -> Display
watch(
	() => [model.value, context.format, focused.value] as const,
	([model, format, focused]) => {
		if (focused) return
		display.value = print(model, format)
	},
	{immediate: true, flush: 'sync'}
)

let localAtFocus = 0

const parse = computed(() =>
	compileTimeExpression(display.value, props.frameRate)
)

const parseResult = computed(() =>
	parse.value(localAtFocus, {i: multi.index, fps: props.frameRate})
)

const validLocal = ref<number>()

watchSyncEffect(() => {
	if (parseResult.value.value === undefined) return

	validLocal.value = parseResult.value.value

	if (focused.value) {
		model.value = scalar.clamp(validLocal.value, props.min, props.max)
	}
})

watchSyncEffect(() => {
	const _parse = parse.value
	if (!tweaking.value && !focused.value) return

	multi.update((x, ctx) => {
		const result = _parse(x, {...ctx, fps: props.frameRate})
		return result.value === undefined ? x : result.value
	})
})

function confirm() {
	emit('confirm')
	nextTick(() => {
		display.value = print(model.value, context.format)
	})
}

function onFocus() {
	localAtFocus = model.value
	multi.capture()
	emit('focus')
}

function onBlur() {
	confirm()
	emit('blur')
}

function onReset() {
	if (props.default !== undefined) {
		model.value = props.default
		emit('confirm')
	}
}

// Right-click menu: switch the (app-wide, persisted) display format. A check
// marks the active one; the display re-renders via the format watcher.
const formatMenuItems = computed<MenuItem[]>(() => [
	{
		label: 'Frames',
		icon: context.format === 'frames' ? 'mdi:check' : undefined,
		perform: () => (context.format = 'frames'),
	},
	{
		label: 'SMPTE Timecode',
		icon: context.format === 'timecode' ? 'mdi:check' : undefined,
		perform: () => (context.format = 'timecode'),
	},
])

//------------------------------------------------------------------------------
// Display

const digits = computed(() => {
	if (context.format === 'frames') {
		return null
	}
	return display.value.split(':').reverse()
})

function getDigitLabel(i: number) {
	if (i === 0) return 'F'
	if (i === 1) return 'Secs'
	if (i === 2) return 'Mins'
	return 'Hrs'
}

//------------------------------------------------------------------------------
// Hotkeys

function increment(inc: number) {
	model.value = scalar.clamp(model.value + inc, props.min, props.max)
	confirm()
}

//------------------------------------------------------------------------------
// Overlay

function radialLine(t: number, innerRadius: number, outerRadius: number) {
	const deg = t * 360 - 90
	return svgLine(
		vec2.dir(deg, innerRadius, [50, 50]),
		vec2.dir(deg, outerRadius, [50, 50])
	)
}

const meters = computed(() => {
	const scale = tweakScale.value
	const fps = props.frameRate

	let angles
	if (scale === 0) {
		angles = range(0, 1, 1 / fps)
	} else {
		angles = range(0, 1, 1 / 12)
	}

	const lines = angles.map(a => radialLine(a, 48, 49))

	return mergeSvgPaths(lines)
})

const frameTick = computed(() => {
	const f = model.value % props.frameRate
	return radialLine(f / props.frameRate, 48, 48)
})

const secondTick = computed(() => {
	const s = Math.floor(model.value / props.frameRate) % 60
	return radialLine(s / 60, -15, 45)
})

const minuteTick = computed(() => {
	const m = Math.floor(model.value / (props.frameRate * 60)) % 60
	return radialLine(m / 60, 0, 40)
})

const hourTick = computed(() => {
	const h = Math.floor(model.value / (props.frameRate * 60 * 60)) % 24

	if (h === 0) return ''

	return radialLine(h / 12, 0, 20)
})
</script>

<template>
	<InputTextBase
		ref="$input"
		v-model:focused="focused"
		v-model="display"
		class="TqInputTime"
		data-tq-input-time=""
		:inline-position="inlinePosition"
		:block-position="blockPosition"
		:ignoreInput="!focused"
		:active="multi.subfocus"
		:disabled="props.disabled"
		:invalid="props.invalid || parseResult.log.length > 0"
		font="numeric"
		leftIcon="mdi-clock"
		align="center"
		:default="props.default"
		:menuItems="formatMenuItems"
		@confirm="confirm"
		@reset="onReset"
		@focus="onFocus"
		@blur="onBlur"
		@pointerenter="tweakScaleByHover = 0"
		@keydown.exact.up.prevent="increment(frameRate)"
		@keydown.exact.down.prevent="increment(-frameRate)"
		@keydown.exact.alt.up.prevent="increment(1)"
		@keydown.exact.alt.down.prevent="increment(-1)"
		@keydown.exact.shift.up.prevent="increment(60 * frameRate)"
		@keydown.exact.shift.down.prevent="increment(-60 * frameRate)"
	>
		<template #inactiveContent>
			<div data-tq-part="time-digits">
				<template v-if="digits">
					<template v-for="(digit, i) in digits" :key="i">
						<div
							data-tq-time-digit=""
							:data-tq-digit-index="i"
							:data-tq-active="tweakScale === i ? '' : undefined"
							data-tq-part="digit"
							@pointerenter="tweakScaleByHover = i"
						>
							{{ digit }}
							<Tooltip v-if="tweakScale === i" data-tq-part="digit-label">
								<label>{{ getDigitLabel(i) }}</label>
							</Tooltip>
						</div>
						<div v-if="i !== digits.length - 1" data-tq-part="separator">:</div>
					</template>
				</template>
				<div v-else data-tq-part="frame-display">
					{{ display }}
				</div>
			</div>
		</template>
		<template #front>
			<TweakOverlay v-if="tweaking || overlayMounted">
				<div
					:style="overlayStyle"
					data-tq-component="input-time-overlay"
					:data-tq-leaving="overlayLeaving ? '' : undefined"
					data-tq-part="overlay"
					@transitionend.self="overlayLeaving && finishOverlayLeave()"
				>
					<svg viewBox="0 0 100 100" data-tq-part="overlay-svg">
						<path :d="meters" data-tq-tick="meters" />
						<path
							:d="frameTick"
							data-tq-tick="frame"
							:data-tq-active="tweakScale === 0 ? '' : undefined"
						/>
						<path
							:d="secondTick"
							data-tq-tick="second"
							:data-tq-active="tweakScale === 1 ? '' : undefined"
						/>
						<path
							:d="minuteTick"
							data-tq-tick="minute"
							:data-tq-active="tweakScale === 2 ? '' : undefined"
						/>
						<path
							:d="hourTick"
							data-tq-tick="hour"
							:data-tq-active="tweakScale === 3 ? '' : undefined"
						/>
					</svg>
				</div>
			</TweakOverlay>
		</template>
	</InputTextBase>
</template>
