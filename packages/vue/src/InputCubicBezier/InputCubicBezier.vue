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
		:aria-expanded="open"
		:inline-position="props.inlinePosition"
		:block-position="props.blockPosition"
		data-tq-component="input-cubic-bezier"
		:data-tq-open="open ? '' : undefined"
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
		<div
			class="floating"
			data-tq-component="input-cubic-bezier-floating"
			data-tq-part="floating"
		>
			<InputCubicBezierPicker
				:modelValue="modelValue"
				:disabled="props.disabled"
				@update:modelValue="emit('update:modelValue', $event)"
				@confirm="emit('confirm')"
			/>
		</div>
	</Popover>
</template>
