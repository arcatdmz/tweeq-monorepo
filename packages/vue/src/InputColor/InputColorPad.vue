<script lang="ts" setup>
import {
	useEventListener,
	useFocus,
	useFocusWithin,
	useMagicKeys,
	whenever,
} from '@vueuse/core'
import chroma from 'chroma-js'
import Color from 'colorjs.io'
import {vec2} from 'linearly'
import {
	computed,
	onBeforeUnmount,
	ref,
	shallowRef,
	useTemplateRef,
	watch,
} from 'vue'

import {GlslCanvas} from '../GlslCanvas'
import {Popover} from '../Popover'
import {useMultiSelectStore} from '../stores/multiSelect'
import {useThemeStore} from '../stores/theme'
import {Tooltip} from '../Tooltip'
import {TweakOverlay} from '../TweakOverlay'
import {InputEmits} from '../types'
import {useCopyPaste} from '../use/useCopyPaste'
import {useDrag} from '../use/useDrag'
import InputColorPicker from './InputColorPicker.vue'
import PadFragmentString from '@tweeq/dom/shaders/pad.frag'
import SliderFragmentString from '@tweeq/dom/shaders/slider.frag'
import {
	type ColorChannel,
	colorChannelToIndex,
	type HSVA,
	type InputColorProps,
} from './types'
import {
	css2hsva,
	getColorPadTweak,
	getHSVAChannel,
	hsv2rgb,
	hsva2hex,
	tweakHSVAChannel,
} from './utils'
import WheelFragmentString from '@tweeq/dom/shaders/wheel.frag'

const model = defineModel<string>({required: true})
const props = withDefaults(defineProps<InputColorProps>(), {
	alpha: true,
})
const emit = defineEmits<
	InputEmits & {
		'update:tweaking': [boolean]
	}
>()

const theme = useThemeStore()

defineSlots<{
	default: void
}>()

const $button = useTemplateRef('$button')
const open = ref(false)

const {shift, meta, control, alt, h, f, a, s, v, r, g, b} = useMagicKeys()

const ctrlOrCommand = computed(() => meta.value || control.value)

const tweakMode = computed(() => {
	if (shift.value || h.value || f.value) {
		return 'h'
	}

	if (s.value) return 's'
	if (v.value) return 'v'

	if (r.value) return 'r'
	if (g.value) return 'g'
	if (b.value) return 'b'

	if (props.alpha && (alt.value || a.value)) {
		return 'a'
	}

	return 'pad'
})

const local = shallowRef<HSVA>({h: 0, s: 0, v: 0, a: 0})
const decompose = css2hsva
const compose = hsva2hex

const $floating = useTemplateRef('$floating')
const floatingFocused = useFocusWithin($floating).focused

const temporarilyHidePopup = computed(() => {
	return !floatingFocused.value && (shift.value || ctrlOrCommand.value)
})

const tweakWidth = theme.popupWidth

let localOnTweak: HSVA | null = null

const {origin, dragging: tweaking} = useDrag($button, {
	disabled: computed(() => props.disabled ?? false),
	lockPointer: true,
	onClick() {
		if (multi.multiSelected) return
		open.value = !open.value
	},
	onDragStart() {
		local.value = localOnTweak = decompose(model.value)
		multi.capture()
		emit('update:tweaking', true)
	},
	onDrag({delta}) {
		const [dx, dy] = vec2.div(delta, [tweakWidth, -tweakWidth])

		const mode = tweakMode.value

		const result = getColorPadTweak(
			local.value,
			localOnTweak!,
			mode,
			dx,
			dy
		)
		local.value = result.value
		multi.update(result.updateRelated)

		model.value = compose(local.value)
	},
	onDragEnd() {
		emit('confirm')
		multi.confirm()
		emit('update:tweaking', false)
	},
})

/**
 * Wheel is assigned to tewak the hue
 */
const wheelTweaking = ref(false)
let wheelTweakingTimeout: ReturnType<typeof setTimeout> | undefined
const overlayMounted = ref(false)
const overlayLeaving = ref(false)
let overlayLeavingTimeout: ReturnType<typeof setTimeout> | undefined

function finishOverlayLeave() {
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

onBeforeUnmount(() => {
	clearTimeout(wheelTweakingTimeout)
	clearTimeout(overlayLeavingTimeout)
})

useEventListener(
	$button,
	'wheel',
	e => {
		if (tweaking.value) {
			e.preventDefault()
			e.stopPropagation()
			local.value = tweakHSVAChannel(local.value, 'h', (e.deltaY / 360) * 0.5)
			model.value = compose(local.value)

			const delta =
				getHSVAChannel(local.value, 'h') - getHSVAChannel(localOnTweak!, 'h')
			multi.update(hsva => tweakHSVAChannel(hsva, 'h', delta))
		}
		if (tweaking.value) {
			wheelTweaking.value = true
			clearTimeout(wheelTweakingTimeout)
			wheelTweakingTimeout = setTimeout(() => {
				wheelTweaking.value = false
			}, 500)
		}
	},
	{passive: false}
)

watch(tweakMode, () => {
	if (!tweaking.value) return

	localOnTweak = local.value
	multi.capture()
})

// Update local value when model value changes externally
watch(
	model,
	model => {
		if (tweaking.value) return

		local.value = decompose(model)
	},
	{immediate: true, flush: 'sync'}
)

whenever(tweaking, () => {
	open.value = false
})

const overlayLabel = computed<[string, string, boolean?][]>(() => {
	const mode = tweakMode.value
	if (mode === 'h') {
		const h = (local.value.h * 360).toFixed(1)
		return [['Hue', h + '°']]
	} else if (mode === 's' || mode === 'v' || mode === 'a') {
		const label = mode === 's' ? 'Sat' : mode === 'v' ? 'Val' : 'α'
		const value = (local.value[mode] * 100).toFixed(1)
		return [[label, value + '%']]
	} else if (mode === 'r' || mode === 'g' || mode === 'b') {
		const label = mode.toUpperCase()
		const rgb = hsv2rgb(local.value)
		const value = (rgb[mode] * 255).toFixed(0)
		return [[label, value, true]]
	} else {
		const s = (local.value.s * 100).toFixed(1)
		const v = (local.value.v * 100).toFixed(1)
		return [
			['Sat', s + '%'],
			['Val', v + '%'],
		]
	}
})

// Styles
const tweakUIOffset = computed(() => {
	return {
		left: `${origin.value[0]}px`,
		top: `${origin.value[1]}px`,
	}
})

const defaultButtonStyle = computed(() => {
	const contrast = Color.contrastWCAG21(model.value, theme.backgroundColor)

	return {
		color: model.value,
		'--outline': contrast > 1.1 ? 'transparent' : 'var(--tq-color-border)',
	}
})

const overlayStyle = computed(() => {
	return {
		transformOrigin: `${origin.value[0]}px ${origin.value[1]}px`,
	}
})

const tweakPreviewStyle = computed(() => {
	let color = chroma(chroma.valid(model.value) ? model.value : 'black')

	if (tweakMode.value !== 'a') {
		color = color.alpha(1)
	}

	return {
		...tweakUIOffset.value,
		color: color.css(),
	}
})

const padStyle = computed(() => {
	return {
		opacity: tweakMode.value === 'pad' ? 1 : 0.1,
		left: `${origin.value[0] - local.value.s * tweakWidth}px`,
		top: `${origin.value[1] - (1 - local.value.v) * tweakWidth}px`,
	}
})

const padUniforms = computed(() => {
	const {h, s, v, a} = local.value
	return {
		hsva: [h, s, v, a],
		axes: [colorChannelToIndex('s'), colorChannelToIndex('v')],
	}
})

const wheelUniforms = computed(() => {
	const {h, s, v, a} = local.value
	return {
		hsva: [h, s, v, a],
	}
})

const wheelStyle = computed(() => {
	return {
		...tweakUIOffset.value,
		opacity: tweakMode.value === 'h' || wheelTweaking.value ? 1 : 0.1,
		rotate: `${local.value.h * -360}deg`,
	}
})

const sliderStyle = computed(() => {
	if (tweakMode.value === 'pad') return {}

	let value: number

	if (
		tweakMode.value === 'r' ||
		tweakMode.value === 'g' ||
		tweakMode.value === 'b'
	) {
		const rgb = hsv2rgb(local.value)
		value = rgb[tweakMode.value]
	} else {
		value = local.value[tweakMode.value]
	}

	const offsetAxis = -(value - 0.5) * tweakWidth

	const offset: vec2 =
		tweakMode.value === 'v' ? [0, offsetAxis] : [offsetAxis, 0]

	return {
		left: `${origin.value[0] + offset[0]}px`,
		top: `${origin.value[1] - offset[1]}px`,
	}
})

const sliderUniforms = computed(() => {
	const {h, s, v, a} = local.value
	return {
		hsva: [h, s, v, a],
		axis: colorChannelToIndex(tweakMode.value as ColorChannel),
		offset: 0,
	}
})

//------------------------------------------------------------------------------
// Multi Select

const focusing = useFocus($button).focused

const multi = useMultiSelectStore().register({
	type: 'color',
	el: $button,
	focusing,
	getValue: () => local.value,
	setValue(value: HSVA) {
		local.value = value
		model.value = compose(value)
	},
	confirm() {
		emit('confirm')
	},
})

whenever(
	() => multi.multiSelected,
	() => {
		open.value = false
	}
)

//------------------------------------------------------------------------------
// Copy and paste

useCopyPaste({
	target: $button,
	onCopy() {
		navigator.clipboard.writeText(model.value)
	},
	onPaste: async () => {
		const text = await navigator.clipboard.readText()
		if (!text) return
		model.value = text

		const hsva = decompose(text)

		multi.update(() => hsva)
		multi.confirm()
	},
})

//------------------------------------------------------------------------------
// Component settings

defineOptions({
	inheritAttrs: false,
})
</script>

<template>
	<button
		ref="$button"
		v-bind="$attrs"
		class="TqInputColorPad"
		type="button"
		:disabled="disabled"
		:aria-invalid="invalid || undefined"
		data-tq-component="input-color-pad"
		:data-tq-focus="
			(open && temporarilyHidePopup) || multi.subfocus ? '' : undefined
		"
		:data-tq-tweaking="tweaking ? '' : undefined"
		@focus="emit('focus')"
		@blur="emit('blur')"
	>
		<slot>
			<div
				:style="defaultButtonStyle"
				:inline-position="inlinePosition"
				:block-position="blockPosition"
				data-tq-part="swatch"
			/>
		</slot>
	</button>
	<Popover
		:open="open && !temporarilyHidePopup"
		:reference="$button"
		placement="bottom-start"
		@update:open="open = $event"
	>
		<div
			ref="$floating"
			data-tq-component="input-color-pad-popover"
			data-tq-part="floating"
		>
			<InputColorPicker
				v-model="model"
				:alpha="alpha"
				:pickers="pickers"
				:presets="presets"
				@confirm="emit('confirm')"
			/>
		</div>
	</Popover>
	<TweakOverlay v-if="tweaking || overlayMounted">
		<div
			:class="{
				'tq-input-color-pad-overlay-hidden': overlayLeaving,
			}"
			:style="overlayStyle"
			data-tq-component="input-color-pad-overlay"
			:data-tq-tweak-mode="tweakMode"
			data-tq-part="overlay"
			@transitionend.self="overlayLeaving && finishOverlayLeave()"
		>
			<template
				v-if="
					tweakMode === 'pad' ||
					tweakMode === 'h' ||
					tweakMode === 's' ||
					tweakMode === 'v'
				"
			>
				<GlslCanvas
					data-tq-part="overlay-pad"
					:fragmentString="PadFragmentString"
					:uniforms="padUniforms"
					:style="padStyle"
				/>
				<GlslCanvas
					data-tq-part="wheel"
					:fragmentString="WheelFragmentString"
					:uniforms="wheelUniforms"
					:style="wheelStyle"
				/>
			</template>
			<GlslCanvas
				v-if="
					tweakMode === 's' ||
					tweakMode === 'v' ||
					tweakMode === 'r' ||
					tweakMode === 'g' ||
					tweakMode === 'b' ||
					tweakMode === 'a'
				"
				:fragmentString="SliderFragmentString"
				:uniforms="sliderUniforms"
				:style="sliderStyle"
				data-tq-part="slider"
				:data-tq-vertical="tweakMode === 'v' ? '' : undefined"
			/>
			<div data-tq-part="tweak-preview" :style="tweakPreviewStyle" />
			<Tooltip data-tq-part="overlay-label" :style="tweakUIOffset">
				<span
					v-for="([label, value, rgb], i) in overlayLabel"
					:key="i"
					data-tq-part="label-pair"
				>
					<label>{{ label }}</label>{{ ' ' }}
					<span data-tq-part="label-value" :data-tq-rgb="rgb ? '' : undefined">
						{{ value }}
					</span>
				</span>
			</Tooltip>
		</div>
	</TweakOverlay>
</template>
