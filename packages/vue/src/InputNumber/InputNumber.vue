<script lang="ts" setup>
import {
	unrefElement,
	useElementBounding,
	useMagicKeys,
	whenever,
} from '@vueuse/core'
import {scalar} from 'linearly'
import {
	Component,
	computed,
	nextTick,
	ref,
	type StyleValue,
	unref,
	useTemplateRef,
	watch,
	watchSyncEffect,
} from 'vue'

import {Icon} from '../Icon'
import {InputTextBase} from '../InputTextBase'
import {useMultiSelectStore} from '../stores/multiSelect'
import {InputEmits} from '../types'
import {useDrag} from '../use/useDrag'
import {useValidator} from '../use/useValidator'
import {
	compileNumberExpression,
	getInputNumberPrecision,
	type NumberScrubState,
	precisionOf,
	toFixed,
	toPercent,
	updateNumberScrub,
} from '@tweeq/core'
import * as V from '@tweeq/core/validator'
import InputNumberScales from './InputNumberScales.vue'
import {type InputNumberProps} from './types'

const model = defineModel<number>({required: true})

const props = withDefaults(defineProps<InputNumberProps>(), {
	min: Number.MIN_SAFE_INTEGER,
	max: Number.MAX_SAFE_INTEGER,
	bar: 0,
	snap: 10,
	clampMin: true,
	clampMax: true,
	precision: 4,
	prefix: '',
	suffix: '',
})

const emit = defineEmits<InputEmits>()

function onReset() {
	if (props.default !== undefined) {
		model.value = props.default
		emit('confirm')
	}
}

const $input = useTemplateRef('$input')
const $inputEl = computed(() => unrefElement($input.value as Component))
const {left, width, right} = useElementBounding($inputEl)

const focused = ref(false)
const expressionEnabled = ref(false)
const expressionError = ref<string | undefined>(undefined)

const local = ref(model.value)
const display = ref('')

const barVisible = computed(() => {
	return (
		props.bar !== false &&
		props.min !== Number.MIN_SAFE_INTEGER &&
		props.max !== Number.MAX_SAFE_INTEGER &&
		width.value > 0
	)
})

const validMin = computed(() =>
	props.clampMin ? props.min : Number.MIN_SAFE_INTEGER
)
const validMax = computed(() =>
	props.clampMax ? props.max : Number.MAX_SAFE_INTEGER
)

const {alt: lessSpeedKey, shift: moreSpeedKey, q: snapKey} = useMagicKeys()
const speedMultiplierKey = computed(() => {
	return (lessSpeedKey.value ? 0.1 : 1) * (moreSpeedKey.value ? props.snap : 1)
})
const speedMultiplierGesture = ref(1)
const speed = computed(() => {
	return speedMultiplierKey.value * speedMultiplierGesture.value
})

const precision = computed(() =>
	getInputNumberPrecision({
		step: props.step,
		display: display.value,
		width: width.value,
		min: props.min,
		max: props.max,
		tweaking: tweaking.value,
		speed: speed.value,
		precision: props.precision,
	})
)

const minSpeed = computed(() => {
	let prec = props.precision

	if (props.step && barVisible.value) {
		const stepCount = (props.max - props.min) / props.step
		const pxPerStep = width.value / stepCount

		prec = precisionOf(pxPerStep)
	}

	return 10 ** -prec
})

const maxSpeed = computed(() => {
	return barVisible.value ? 1 : 1000
})

let deltaAccumulated = 0
let offsetWeight = 1
let scrubState: NumberScrubState & {deltaValue: number} = {
	local: local.value,
	directionAverage: [1, 0],
	offsetWeight: 1,
	gestureSpeed: 1,
	deltaValue: 0,
}

// Whether the value currently sits within [min, max]. Out of range there's no
// in-bar handle to grab, so the over-range strips take over as the scrub grip.
const insideRange = computed(
	() => props.min <= model.value && model.value <= props.max
)

// True when a drag began while the field was already focused (text editing).
// Such a drag scrubs the value via a grab zone but must NOT steal text focus,
// so we skip the focus/blur bracketing the unfocused path uses.
let dragStartedFocused = false

const {dragging: tweaking} = useDrag($input, {
	lockPointer: computed(() => !barVisible.value),
	disabled: computed(() => props.disabled),
	// While focused, only the stable grab affordances start a drag; pressing the
	// text area falls through to the <input> to place a caret / edit. `closest` so
	// a press on a child (e.g. the grip's hint icon / its inner SVG) still counts.
	shouldDrag(event) {
		if (!focused.value) return true
		return !!(event.target as Element | null)?.closest(
			'[data-tq-number-scrub]'
		)
	},
	onClick() {
		$input.value?.select()
	},
	onDragStart(state, event) {
		const grabbed = !!(event.target as Element).closest(
			'[data-tq-number-scrub]'
		)
		dragStartedFocused = focused.value

		if (barVisible.value && insideRange.value && !grabbed) {
			// Absolute Mode — jump to the pressed position. Only reachable while
			// unfocused; focused presses on the bar go to the text input instead.
			local.value = scalar.fit(
				state.xy[0],
				left.value,
				right.value,
				props.min,
				props.max
			)

			multi.update(() => local.value)
		}

		deltaAccumulated = 0
		scrubState = {
			local: local.value,
			directionAverage: [1, 0],
			offsetWeight: 1,
			gestureSpeed: 1,
			deltaValue: 0,
		}
		speedMultiplierGesture.value = 1
		offsetWeight = 1

		if (!dragStartedFocused) emit('focus')
		multi.capture()
	},
	onDrag(state) {
		scrubState = updateNumberScrub({
			state: scrubState,
			delta: state.delta,
			barVisible: barVisible.value,
			min: props.min,
			max: props.max,
			width: width.value,
			step: props.step,
			speed: speedMultiplierKey.value * scrubState.gestureSpeed,
			minSpeed: minSpeed.value,
			maxSpeed: maxSpeed.value,
		})
		local.value = scrubState.local
		offsetWeight = scrubState.offsetWeight
		speedMultiplierGesture.value = scrubState.gestureSpeed

		deltaAccumulated += scrubState.deltaValue
		multi.update(v => v + deltaAccumulated)

		snapEnabled.value = snapKey.value
	},
	onDragEnd() {
		confirm()

		if (dragStartedFocused) {
			// Stay in text-edit mode; re-select so typing replaces the value the
			// scrub just produced.
			nextTick(() => $input.value?.select())
		} else {
			emit('blur')
		}
	},
})

//------------------------------------------------------------------------------
// Emit update:modelValue when the local value is changed

const snapEnabled = ref(false)

whenever(snapKey, () => {
	snapEnabled.value = tweaking.value
})

const validate = computed(() =>
	V.compose(
		V.clamp(validMin.value, validMax.value),
		V.quantize(props.step ?? 0),
		V.quantize(snapEnabled.value ? props.snap : 0)
	)
)

const {validateResult, validLocal} = useValidator(local, validate)

const invalid = computed(() => {
	if (props.invalid) return true
	if (tweaking.value) return false

	return validateResult.value.log.length > 0 || !!expressionError.value
})

function confirm() {
	emit('confirm')
	multi.confirm()
	multi.capture()

	expressionEnabled.value = false
	expressionError.value = undefined

	nextTick(() => {
		local.value = model.value
		display.value = print.value(model.value)
	})
}

//------------------------------------------------------------------------------
// Input Events

let localAtFocus = 0

function onFocus() {
	multi.capture()
	emit('focus')
}

function enableExpression() {
	localAtFocus = local.value
	expressionEnabled.value = true
}

function onKeydown(e: KeyboardEvent) {
	if (e.metaKey && e.key === '=') {
		e.preventDefault()
		enableExpression()
	}
}

function onInput(e: Event) {
	const value = (e.target as HTMLInputElement).value
	display.value = value

	if (!/^[0-9.]*$/.test(value)) {
		enableExpression()
	}

	try {
		const fn = compileNumberExpression(value)
		local.value = fn(localAtFocus, {i: multi.index})
		expressionError.value = undefined
		multi.update(fn)
	} catch (e) {
		expressionError.value = (e as Error).message
	}
}

function onBlur() {
	confirm()
	emit('blur')
}

const print = computed(() => {
	const _tweaking = tweaking.value
	const _precision = precision.value

	return (local: number) => {
		return _tweaking ? local.toFixed(_precision) : toFixed(local, _precision)
	}
})

//------------------------------------------------------------------------------
// Hotkeys

function onIncrementByKey(delta: number) {
	if (props.step) {
		// If step is defined
		local.value += props.step * delta * Math.max(1, speedMultiplierKey.value)
	} else {
		let multiplier = speedMultiplierKey.value

		if (validMax.value - validMin.value <= 1) {
			multiplier *= 0.1
		}

		local.value += delta * multiplier
		local.value = scalar.clamp(local.value, validMin.value, validMax.value)
	}

	nextTick(() => {
		display.value = print.value(model.value)
	})
}

//------------------------------------------------------------------------------
// Watchers

// When the model value is changed from outside, update the local value
watch(
	model,
	model => {
		if (model !== validLocal.value) {
			local.value = model
		}
	},
	{immediate: true, flush: 'sync'}
)
// When the model value is changed from outside while the input is not focused,
// update the display value properly
watch(
	() => [model.value, focused.value, print.value, tweaking.value] as const,
	([model, focused, print, tweaking], prev) => {
		// While focused, keep the user's typed text — unless an active scrub (via a
		// grab zone) is driving the value, in which case mirror it live.
		if (focused && prev?.[1] && !tweaking) return

		display.value = print(model)
	},
	{immediate: true, flush: 'sync'}
)

let emittedModel: number | undefined

watchSyncEffect(() => {
	if (
		validLocal.value !== undefined &&
		validLocal.value !== model.value &&
		validLocal.value !== emittedModel
	) {
		emittedModel = validLocal.value
		model.value = emittedModel
	}
})

// Click to select all
whenever(focused, () => nextTick(() => $input.value?.select()))

//------------------------------------------------------------------------------
// Multi Select

const multi = useMultiSelectStore().register({
	type: 'number',
	el: $input,
	focusing: computed(() => focused.value || tweaking.value),
	speed: computed(() => {
		if (!barVisible.value) return 1
		return (props.max - props.min) / width.value
	}),
	getValue: () => local.value,
	setValue(value) {
		const result = unref(validate)(value)
		if (result.value === undefined) return false

		local.value = result.value
	},
	confirm() {
		emit('confirm')
	},
})

//------------------------------------------------------------------------------
// Styles

const rangeState = computed(() => {
	if (!barVisible.value) return undefined
	if (model.value < props.min) return 'below'
	if (model.value > props.max) return 'above'
	return undefined
})

// The tweak overlay's scale dots visualise the (continuous) drag sensitivity.
// They're pointless for a value that's both stepped and clamped — it only moves
// between a fixed set of discrete stops, so hide them while tweaking (the step
// grid + bar already show the granularity).
const showTweakScale = computed(() => {
	const stepped = !!props.step
	const clamped =
		props.clampMin &&
		props.clampMax &&
		props.min !== Number.MIN_SAFE_INTEGER &&
		props.max !== Number.MAX_SAFE_INTEGER
	return !(stepped && clamped)
})

const scaleAttrs = (offset: number) => {
	const base = 10

	const precision = scalar.mod(
		-Math.log(speedMultiplierGesture.value) / Math.log(base) + offset,
		3
	)

	const opacity = Math.pow(scalar.smoothstep(1, 2, precision), 0.5)

	const halfWidth = width.value / 2

	const dashoffset = barVisible.value
		? scalar.efit(model.value, props.min, props.max, 0, width.value)
		: halfWidth - model.value / speedMultiplierGesture.value

	return {
		x1: -halfWidth,
		x2: halfWidth,
		style: {
			'--offset-weight': offsetWeight,
			'--gesture-precision': precision,
			strokeDashoffset: -dashoffset,
			opacity,
		},
	}
}

const handleStyles = computed<StyleValue>(() => {
	if (!barVisible.value) return {visibility: 'hidden'}

	const tValue = scalar.invlerp(props.min, props.max, model.value)

	return {
		left: `calc((100% - 1px) * ${tValue})`,
	}
})

// Horizontal position of the in-range grab zones, pinned to the handle. The
// zone's left edge is clamped so the full width stays inside the field — at min
// / max the handle sits flush with an edge, and a centred zone would be half
// clipped away (and ungrabbable). Clamping keeps the whole grip on-screen with
// the handle at its edge.
const zoneStyle = computed<StyleValue>(() => {
	const tValue = scalar.clamp(
		scalar.invlerp(props.min, props.max, model.value),
		0,
		1
	)
	return {
		left:
			`clamp(0px,` +
			` calc((100% - 1px) * ${tValue} - var(--tq-input-height) / 2),` +
			` calc(100% - var(--tq-input-height)))`,
	}
})

// At min / max the handle is flush with an edge, where the thin top/bottom
// strips get eaten by the corner radius — and there's no centred text to protect
// out there anyway. So use a single full-height grab zone at the edges.
const handleAtEdge = computed(
	() =>
		insideRange.value && (model.value <= props.min || model.value >= props.max)
)

const barStyle = computed<StyleValue>(() => {
	if (!barVisible.value || props.bar === false) {
		return {visibility: 'hidden'}
	}

	const origin = typeof props.bar === 'number' ? props.bar : 0
	const tOrigin = scalar.invlerp(props.min, props.max, origin)
	const tValue = scalar.invlerp(props.min, props.max, model.value)

	const left = Math.min(tOrigin, tValue)
	const right = 1 - Math.max(tOrigin, tValue)

	return {
		left: toPercent(left),
		right: toPercent(right),
	}
})
</script>

<template>
	<InputTextBase
		ref="$input"
		v-model:focused="focused"
		data-tq-input-number=""
		:data-tq-range="rangeState"
		:data-tq-tweaking="tweaking ? '' : undefined"
		:ignoreInput="!focused"
		:modelValue="display"
		:active="multi.subfocus"
		:font="expressionEnabled ? 'monospace' : 'numeric'"
		align="center"
		:inline-position="inlinePosition"
		:block-position="blockPosition"
		:disabled="disabled"
		:invalid="invalid"
		:leftIcon="leftIcon"
		:rightIcon="rightIcon"
		:default="props.default"
		@focus="onFocus"
		@blur="onBlur"
		@input="onInput"
		@keydown="onKeydown"
		@keydown.up.prevent="onIncrementByKey(1)"
		@keydown.down.prevent="onIncrementByKey(-1)"
		@keydown.enter.prevent="confirm"
		@reset="onReset"
	>
		<template #inactiveContent>
			<div data-tq-part="number-display"><span v-if="prefix" data-tq-part="prefix">{{ prefix }}</span>{{ display }}<span v-if="suffix" data-tq-part="suffix">{{ suffix }}</span></div>
		</template>
		<template #back>
			<div data-tq-part="number-bar" :style="barStyle" />
			<InputNumberScales :min="min" :max="max" :step="step" />

			<svg v-if="tweaking && showTweakScale" data-tq-part="scrub-scale-overlay">
				<line data-tq-part="scrub-scale" v-bind="scaleAttrs(0)" />
				<line data-tq-part="scrub-scale" v-bind="scaleAttrs(1)" />
				<line data-tq-part="scrub-scale" v-bind="scaleAttrs(2)" />
			</svg>

			<div
				data-tq-number-scrub=""
				data-tq-part="number-handle"
				:style="handleStyles"
			/>
		</template>

		<!-- Grab affordances live above the <input> (the back slot is below it) so
			they can take the pointer while the field is focused for text editing.
			Ranged: transparent grab zones over the handle (top/bottom strips leaving
			a centre text gap; full-height at min/max; full-width when out of range).
			Unranged: no bar to grab, so the left-icon area becomes a horizontal
			scrub grip — falling back to a faint hint icon when there's no leftIcon. -->
		<template #front>
			<template v-if="barVisible">
				<template v-if="insideRange">
					<div
						v-if="handleAtEdge"
						data-tq-number-scrub=""
						data-tq-part="scrub-zone"
						data-tq-zone="edge"
						:style="zoneStyle"
					/>
					<template v-else>
						<div
							data-tq-number-scrub=""
							data-tq-part="scrub-zone"
							data-tq-zone="top"
							:style="zoneStyle"
						/>
						<div
							data-tq-number-scrub=""
							data-tq-part="scrub-zone"
							data-tq-zone="bottom"
							:style="zoneStyle"
						/>
					</template>
				</template>
				<template v-else>
					<div
						data-tq-number-scrub=""
						data-tq-part="scrub-zone"
						data-tq-zone="top"
						data-tq-wide=""
					/>
					<div
						data-tq-number-scrub=""
						data-tq-part="scrub-zone"
						data-tq-zone="bottom"
						data-tq-wide=""
					/>
				</template>
			</template>
			<div v-else data-tq-number-scrub="" data-tq-part="scrub-grip">
				<Icon
					v-if="!leftIcon"
					data-tq-part="scrub-grip-hint"
					icon="mdi:arrow-left-right"
				/>
			</div>
		</template>
	</InputTextBase>
</template>
