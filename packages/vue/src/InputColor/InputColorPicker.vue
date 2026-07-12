<script lang="ts" setup>
import {
	createInputColorPickerController,
	type HSVA,
} from '@tweeq/core'
import {shallowRef, watch} from 'vue'

import {Icon} from '../Icon'
import {InputEmits} from '../types'
import InputColorChannelPad from './InputColorChannelPad.vue'
import InputColorChannelSlider from './InputColorChannelSlider.vue'
import InputColorChannelValues from './InputColorChannelValues.vue'
import InputColorPresets from './InputColorPresets.vue'
import {DefaultColorPickers, type InputColorProps} from './types'

const props = withDefaults(defineProps<InputColorProps>(), {
	alpha: true,
	pickers: () => DefaultColorPickers,
})

const emit = defineEmits<InputEmits>()

const model = defineModel<string>({required: true})

const local = shallowRef<HSVA>({h: 0, s: 0, v: 0, a: 1})
const controller = createInputColorPickerController(model.value, {
	onChange(value) {
		model.value = value
	},
	onUpdate(value) {
		local.value = value
	},
})
local.value = controller.value

watch(
	model,
	model => controller.sync(model),
	{flush: 'sync'}
)

// EyeDropper
const isEyeDropperSupported =
	typeof window !== 'undefined' && 'EyeDropper' in window

async function pickColor() {
	const eyeDropper = new (window as any)['EyeDropper']()
	try {
		controller.updateCode((await eyeDropper.open()).sRGBHex)
		emit('confirm')
	} catch (error) {
		if (error instanceof DOMException && error.name === 'AbortError') return
		throw error
	}
}
</script>

<template>
	<div class="TqInputColorPicker" data-tq-part="picker">
		<template v-for="([type, ch], i) in pickers">
			<InputColorChannelPad
				v-if="type === 'pad'"
				:key="i"
				:modelValue="local"
				:axes="ch"
				:disabled="props.disabled"
				@update:modelValue="controller.updateHSVA"
			/>
			<InputColorChannelSlider
				v-if="type === 'slider' && !(!alpha && ch === 'a')"
				:key="i"
				:modelValue="local"
				:axis="ch"
				:disabled="props.disabled"
				@update:modelValue="controller.updateHSVA"
			/>
			<InputColorChannelValues
				v-if="type === 'values'"
				:key="i"
				:colorCode="modelValue"
				:hsva="local"
				:alpha="alpha"
				:disabled="props.disabled"
				@update:colorCode="controller.updateCode"
				@update:hsva="controller.updateHSVA"
			/>
		</template>
		<InputColorPresets
			:presets="presets"
			:disabled="props.disabled"
			@update:modelValue="controller.updateCode($event); emit('confirm')"
		/>
		<button
			v-if="isEyeDropperSupported"
			type="button"
			class="eyeDropper"
			:disabled="props.disabled"
			aria-label="Pick a color from the screen"
			data-tq-part="eye-dropper"
			@click="pickColor"
		>
			<Icon icon="material-symbols:colorize" />
		</button>
	</div>
</template>

<style lang="stylus" scoped>
@import './common.styl'

.TqInputColorPicker
	padding 0
	display grid
	gap var(--tq-gap-control)


.eyeDropper
	display block
	margin 0 auto
</style>
