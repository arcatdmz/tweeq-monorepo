<script lang="ts" setup>
import {uniqueId} from 'lodash-es'
import {ref, useTemplateRef} from 'vue'

import {InputEmits} from '../types'
import {InputSwitchProps} from './types'
import {useInputSwitch} from './utils'

const model = defineModel<boolean>({required: true})

const props = defineProps<InputSwitchProps>()

const emit = defineEmits<InputEmits>()

const id = ref(uniqueId('InputSwitch_'))

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
	<div class="TqInputSwitch" data-tq-component="input-switch" data-tq-part="root" :aria-invalid="invalid || undefined">
		<div
			ref="track"
			class="track"
			:class="{subfocus}"
			data-tq-part="track"
			:data-subfocus="subfocus || undefined"
			:inline-position="inlinePosition"
			:block-position="blockPosition"
		>
			<input
				:id="id"
				ref="input"
				:checked="!!model"
				:disabled="disabled"
				class="input"
				data-tq-part="input"
				type="checkbox"
			/>
			<div
				class="handle"
				:class="{tweaking: tweakingValue !== null}"
				:data-tweaking="tweakingValue !== null || undefined"
				data-tq-part="handle"
			/>
		</div>
		<label v-if="label" :for="id" data-tq-part="label">
			{{ label }}
		</label>
	</div>
</template>
