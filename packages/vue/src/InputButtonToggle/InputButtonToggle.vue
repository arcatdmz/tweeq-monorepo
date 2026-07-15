<script lang="ts" setup>
import {Icon} from '../Icon'
import {InputButtonToggleProps} from './types'

const model = defineModel<boolean>({required: true})

defineProps<InputButtonToggleProps>()
</script>

<template>
	<!--
		@mousedown.prevent keeps a mouse click from focusing the button (the click
		still toggles). Without it the button retains focus after a click and a
		later Enter/Space flips it again unexpectedly. Keyboard (Tab) focus is
		unaffected, so keyboard toggling still works — matching :focus-visible.
	-->
	<button
		class="TqInputButtonToggle"
		:class="{checked: model}"
		:inline-position="inlinePosition"
		:block-position="blockPosition"
		:disabled="!!disabled"
		:aria-invalid="invalid || undefined"
		:aria-pressed="model"
		data-tq-component="input-button-toggle"
		data-tq-part="root"
		@mousedown.prevent
		@click="model = !model"
	>
		<Icon v-if="icon" class="icon" :icon="icon" data-tq-part="icon" />
		<span v-if="label" class="label" data-tq-part="label">{{ label }}</span>
	</button>
</template>
