<script lang="ts" setup>
import {vec2} from 'linearly'
import {computed, useTemplateRef} from 'vue'

import {GlslCanvas} from '../GlslCanvas'
import {useDrag} from '../use/useDrag'
import {toPercent} from '@tweeq/core'
import FragmentString from '@tweeq/dom/shaders/pad.frag'
import {type ColorChannel, colorChannelToIndex, HSVA} from './types'
import {
	getHSVAChannel,
	hsva2hex,
	setHSVAChannel,
	tweakHSVAChannel,
} from './utils'

interface Props {
	axes: readonly [ColorChannel, ColorChannel]
	modelValue: HSVA
	disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
	'update:modelValue': [HSVA]
}>()

const $root = useTemplateRef('$root')

let local: HSVA
// let isRelative = false

const {
	dragging: sliderTweaking,
	left,
	top,
	right,
	bottom,
	xy,
} = useDrag($root, {
	disabled: computed(() => props.disabled),
	dragDelaySeconds: 0,
	onDragStart({left, right, top, bottom, xy}, event) {
		local = props.modelValue

		const isAbsolute = event.target === $root.value

		if (isAbsolute) {
			const values = vec2.invlerp([left, bottom], [right, top], xy)

			local = setHSVAChannel(local, props.axes[0], values[0])
			local = setHSVAChannel(local, props.axes[1], values[1])

			emit('update:modelValue', local)
		}
	},
	onDrag({xy, initial, width, height}) {
		let newLocal = {...local}

		const delta = vec2.div(vec2.sub(xy, initial), [width, -height])

		newLocal = tweakHSVAChannel(newLocal, props.axes[0], delta[0])
		newLocal = tweakHSVAChannel(newLocal, props.axes[1], delta[1])

		emit('update:modelValue', newLocal)
	},
})

const tweakingInside = computed(() => {
	return (
		sliderTweaking.value &&
		left.value <= xy.value[0] &&
		right.value >= xy.value[0] &&
		top.value <= xy.value[1] &&
		bottom.value >= xy.value[1]
	)
})

const uniforms = computed(() => {
	const {h, s, v, a} = props.modelValue
	return {
		hsva: [h, s, v, a],
		axes: props.axes.map(colorChannelToIndex),
	}
})

const circleStyle = computed(() => {
	const x = getHSVAChannel(props.modelValue, props.axes[0])
	const y = getHSVAChannel(props.modelValue, props.axes[1])

	return {
		left: toPercent(x),
		bottom: toPercent(y),
		background: hsva2hex({...props.modelValue, a: 1}),
	}
})
</script>

<template>
	<div
		ref="$root"
		class="TqInputColorChannelPad"
		data-tq-component="input-color-channel-pad"
		data-tq-part="root"
		:style="{cursor: tweakingInside ? 'none' : undefined}"
	>
		<GlslCanvas
			class="canvas"
			data-tq-part="canvas"
			:fragmentString="FragmentString"
			:uniforms="uniforms"
		/>
		<div
			class="circle"
			:class="{tweaking: sliderTweaking}"
			:data-tq-tweaking="sliderTweaking ? '' : undefined"
			data-tq-part="handle"
			:style="circleStyle"
		/>
	</div>
</template>
