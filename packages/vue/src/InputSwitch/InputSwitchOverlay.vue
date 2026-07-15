<script lang="ts" setup>
import {Icon} from '../Icon'

defineProps<{
	modelValue: null | boolean
}>()
</script>
<template>
	<Transition
		enter-from-class="tq-input-switch-overlay-hidden"
		leave-to-class="tq-input-switch-overlay-hidden"
	>
		<div
			v-if="modelValue !== null"
			class="overlay"
			data-tq-component="input-switch-overlay"
			data-tq-part="switch-overlay"
		>
			<Icon
				class="icon off"
				:class="{active: modelValue === false}"
				icon="ic:baseline-radio-button-unchecked"
				data-tq-part="switch-state-icon"
				data-tq-value="off"
				:data-tq-active="modelValue === false ? '' : undefined"
			/>
			<Icon
				class="icon on"
				:class="{active: modelValue === true}"
				icon="ic:baseline-check-circle"
				data-tq-part="switch-state-icon"
				data-tq-value="on"
				:data-tq-active="modelValue === true ? '' : undefined"
			/>
		</div>
	</Transition>
</template>
