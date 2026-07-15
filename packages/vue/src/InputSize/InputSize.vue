<script setup lang="ts">
import {updateSizeWithRatio} from '@tweeq/core'
import {vec2} from 'linearly'
import {ref} from 'vue'

import {Icon} from '../Icon'
import {InputVec} from '../InputVec'
import {InputEmits, InputProps} from '../types'

const model = defineModel<vec2>({required: true})

const props = defineProps<InputProps>()
const emit = defineEmits<InputEmits>()

const keepRatio = ref(true)

let valueOnEdit = model.value

function onUpdate(value: vec2) {
	const result = updateSizeWithRatio({
		previous: model.value,
		next: value,
		valueOnEdit,
		keepRatio: keepRatio.value,
	})
	keepRatio.value = result.keepRatio
	model.value = result.value
}

function recordValueOnEdit() {
	valueOnEdit = model.value
	emit('focus')
}
</script>

<template>
	<div class="TqInputSize" data-tq-component="input-size" data-tq-part="root">
		<InputVec
			:modelValue="model"
			:icon="['mdi:arrow-left-right', 'mdi:arrow-up-down']"
			:disabled="props.disabled"
			:invalid="props.invalid"
			@update:modelValue="onUpdate"
			@focus="recordValueOnEdit"
			@confirm="emit('confirm')"
			@blur="emit('blur')"
		/>
		<button
			class="chain"
			:class="{active: keepRatio}"
			type="button"
			:disabled="props.disabled"
			:aria-pressed="keepRatio"
			data-tq-part="ratio"
			@click="keepRatio = !keepRatio"
		>
			<Icon
				class="chainIcon"
				data-tq-part="ratio-icon"
				:icon="keepRatio ? 'radix-icons:link-1' : 'radix-icons:link-none-1'"
			/>
		</button>
	</div>
</template>
