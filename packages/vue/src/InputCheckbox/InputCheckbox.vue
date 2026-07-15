<script lang="ts" setup>
import {uniqueId} from 'lodash-es'
import {ref, useTemplateRef} from 'vue'

import Icon from '../Icon/Icon.vue'
import InputSwitchOverlay from '../InputSwitch/InputSwitchOverlay.vue'
import {useInputSwitch} from '../InputSwitch/utils'
import {InputEmits} from '../types'
import {InputCheckboxProps} from './types'

const model = defineModel<boolean>({required: true})

const props = defineProps<InputCheckboxProps>()

const emit = defineEmits<InputEmits>()

const id = ref(uniqueId('InputCheckbox_'))

const track = useTemplateRef('track')
const input = useTemplateRef('input')

const {tweakingValue, subfocus} = useInputSwitch({
	track,
	input,
	props,
	emit,
})
</script>

<template>
	<div
		class="TqInputCheckbox"
		:class="{disabled: props.disabled}"
		:aria-invalid="props.invalid || undefined"
		data-tq-component="input-checkbox"
		:data-disabled="props.disabled || undefined"
		data-tq-part="root"
	>
		<div
			ref="track"
			class="checkbox"
			:class="{subfocus}"
			:block-position="props.blockPosition"
			:inline-position="props.inlinePosition"
			:data-subfocus="subfocus || undefined"
			data-tq-part="track"
		>
			<input
				:id="id"
				ref="input"
				:checked="model"
				:disabled="props.disabled"
				class="input"
				data-tq-part="input"
				type="checkbox"
			/>
			<span class="mark" data-tq-part="mark">
				<Icon :icon="props.icon || 'mdi:check-bold'" />
			</span>
			<InputSwitchOverlay :modelValue="tweakingValue" />
		</div>
		<label v-if="label" :for="id" data-tq-part="label">
			{{ label }}
		</label>
	</div>
</template>
