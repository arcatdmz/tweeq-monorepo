<script lang="ts" setup>
import {rectContainsPoint, type Rect, toPercent} from '@tweeq/core'
import {scalar} from 'linearly'
import {computed, useTemplateRef} from 'vue'

import {GlslCanvas} from '../GlslCanvas'
import {useDrag} from '../use/useDrag'
import SliderFragmentString from '@tweeq/dom/shaders/slider.frag'
import {type ColorChannel, colorChannelToIndex, type HSVA} from './types'
import {
	getHSVAChannel,
	hsva2hex,
	setHSVAChannel,
	tweakHSVAChannel,
} from './utils'

interface Props {
	modelValue: HSVA
	axis: ColorChannel
	disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
	'update:modelValue': [HSVA]
}>()

const $root = useTemplateRef('$root')

let local: HSVA

const {
	dragging: sliderTweaking,
	left,
	right,
	top,
	bottom,
	xy,
} = useDrag($root, {
	disabled: computed(() => props.disabled),
	dragDelaySeconds: 0,
	onDragStart({xy: [x], left, right}, event) {
		local = props.modelValue

		const isAbsolute = event.target === $root.value

		if (isAbsolute) {
			const value = scalar.invlerp(left, right, x)

			local = setHSVAChannel(local, props.axis, value)
			emit('update:modelValue', local)
		}
	},
	onDrag({xy: [x], initial: [ix], width}) {
		let newLocal = {...local}

		const delta = (x - ix) / width

		newLocal = tweakHSVAChannel(newLocal, props.axis, delta)

		emit('update:modelValue', newLocal)
	},
})

const tweakingInside = computed(() => {
	const bound: Rect = [
		[left.value, top.value],
		[right.value, bottom.value],
	]

	return sliderTweaking.value && rectContainsPoint(bound, xy.value)
})

const uniforms = computed(() => {
	const {a, h, s, v} = props.modelValue
	return {
		hsva: [h, s, v, a],
		axis: colorChannelToIndex(props.axis),
		offset: 0,
	}
})

const circleStyle = computed(() => {
	const t = getHSVAChannel(props.modelValue, props.axis)

	return {
		left: toPercent(t),
		background: hsva2hex({...props.modelValue, a: 1}),
	}
})
</script>

<template>
	<div
		ref="$root"
		class="TqInputColorChannelSlider"
		data-tq-component="input-color-channel-slider"
		data-tq-part="root"
		:style="{cursor: tweakingInside ? 'none' : undefined}"
	>
		<GlslCanvas
			class="canvas"
			data-tq-part="canvas"
			:fragmentString="SliderFragmentString"
			:uniforms="uniforms"
		/>
		<button
			type="button"
			:disabled="props.disabled"
			:aria-label="`${props.axis.toUpperCase()} channel`"
			class="circle"
			:class="{tweaking: sliderTweaking}"
			:data-tq-tweaking="sliderTweaking ? '' : undefined"
			data-tq-part="handle"
			:style="circleStyle"
		/>
	</div>
</template>
