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
		data-tq-part="root"
	>
		<div
			ref="track"
			class="checkbox"
			:class="{subfocus}"
			:block-position="props.blockPosition"
			:inline-position="props.inlinePosition"
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

<style lang="stylus" scoped>

.TqInputCheckbox
	display flex
	align-items center
	gap 1em

	// Disabled & inert. Rather than fading the whole control (which made an
	// unchecked box vanish), draw an outlined empty box — same language as a
	// disabled InputString/Number (transparent fill + inset border). A checked
	// box keeps a muted check instead of the accent fill.
	&.disabled
		cursor not-allowed

		// Unchecked: outlined empty box (the faint mark is left untouched).
		.checkbox
			pointer-events none
			background transparent
			box-shadow inset 0 0 0 1px var(--tq-color-border)

		// Checked: a muted gray fill instead of the accent, so the existing
		// (background-colored) check still reads without recoloring the icon.
		.checkbox:has(:checked)
			background var(--tq-color-text-subtle)

		label
			pointer-events none
			color var(--tq-color-text-mute)

.checkbox
	position relative
	background var(--tq-color-input)
	border-radius var(--tq-radius-input)
	width var(--tq-input-height)
	active-transition(background)

	use-input-position()

	// Unchecked: default accent ring just outside (on the input bg). Checked: an
	// inner ring in the off-state button color (input) sits on the accent fill,
	// and the outer accent ring reads against it at the edge — distinct in both
	// modes. See fill-focus-style().
	&:has(.input:focus-visible),
	&.subfocus
		fill-focus-style()

	&:hover
		background var(--tq-color-input-hover)

	&:has(:checked)
		background var(--tq-color-accent)
		--focus-ring inset 0 0 0 1px var(--tq-color-input), 0 0 0 1px var(--tq-color-accent)
		&:hover
			background var(--tq-color-accent-hover)

.input
	display block
	width var(--tq-input-height)
	height var(--tq-input-height)
	margin 0 !important
	opacity 0
	pointer-events none

.mark
	position absolute
	top calc((var(--tq-input-height) - var(--tq-icon-size)) / 2)
	left calc((var(--tq-input-height) - var(--tq-icon-size)) / 2)
	color set-alpha(--tq-color-text-subtle, .3)
	pointer-events none

	input:checked + &
		color var(--tq-color-background)
</style>
