<script lang="ts" setup>
import {getCubicBezierPath, type CubicBezierValue} from '@tweeq/core'
import {computed, ref, useTemplateRef} from 'vue'

import {Popover} from '../Popover'
import type {InputEmits} from '../types'
import InputCubicBezierPicker from './InputCubicBezierPicker.vue'
import type {InputCubicBezierProps} from './types'

const props = defineProps<InputCubicBezierProps>()

const emit = defineEmits<
	InputEmits & {'update:modelValue': [CubicBezierValue]}
>()

defineOptions({
	inheritAttrs: false,
})

const $button = useTemplateRef('$button')
const open = ref(false)

const easingPath = computed(() => getCubicBezierPath(props.modelValue))
</script>

<template>
	<button
		ref="$button"
		class="TqInputCubicBezier"
		:class="{open}"
		v-bind="$attrs"
		type="button"
		:disabled="props.disabled"
		:aria-invalid="props.invalid || undefined"
		:inline-position="props.inlinePosition"
		:block-position="props.blockPosition"
		data-tq-part="root"
		@click="open = true"
		@focus="emit('focus')"
		@blur="emit('blur')"
	>
		<svg class="icon" viewBox="0 0 1 1" data-tq-part="icon">
			<path :d="easingPath" data-tq-part="path" />
		</svg>
	</button>
	<Popover v-model:open="open" :reference="$button">
		<div class="floating">
			<InputCubicBezierPicker
				:modelValue="modelValue"
				:disabled="props.disabled"
				@update:modelValue="emit('update:modelValue', $event)"
				@confirm="emit('confirm')"
			/>
		</div>
	</Popover>
</template>

<style lang="stylus" scoped>

.TqInputCubicBezier
	position relative
	width var(--tq-input-height)
	height var(--tq-input-height)
	border-radius var(--tq-radius-input)
	overflow hidden
	hover-transition(background)
	background var(--tq-color-accent-hover)

	&:hover, &.open
		background var(--tq-color-tinted-input-active)

.icon
	display block
	position absolute
	inset 2px
	overflow visible

	path
		transform scaleY(-1)
		transform-origin 50% 50%
		stroke-width 1.5
		stroke var(--tq-color-accent)
		stroke-linecap round
		fill none
		vector-effect non-scaling-stroke

.floating
	width var(--tq-popup-width)
	height var(--tq-popup-width)
	position relative
	popup-style()
</style>
