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
	<div class="TqInputSwitch" data-tq-part="root" :aria-invalid="invalid || undefined">
		<div
			ref="track"
			class="track"
			:class="{subfocus}"
			data-tq-part="track"
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
				data-tq-part="handle"
			/>
		</div>
		<label v-if="label" :for="id" data-tq-part="label">
			{{ label }}
		</label>
	</div>
</template>

<style lang="stylus" scoped>

.TqInputSwitch
	display flex
	align-items center
	gap 1em

.track
	position relative
	width calc(var(--tq-input-height) * 2)
	border-radius 9999px
	background-color var(--tq-color-input)
	active-transition(background-color)
	height var(--tq-input-height)

	&:hover
		background-color var(--tq-color-input-hover)

	&:has(:checked)
		background-color var(--tq-color-accent)

		&:hover
			background-color var(--tq-color-accent-hover)

	&:has(.input:focus),
	&.subfocus
		&:before
			content ''
			position absolute
			inset -3px
			border 1px solid var(--tq-color-accent)
			border-radius 999px

.handle
	position absolute
	top 4px
	left 4px
	width calc(var(--tq-input-height) - 8px)
	height calc(var(--tq-input-height) - 8px)
	border-radius 9999px
	background-color var(--tq-color-text-subtle)
	active-transition(left, width, background-color)
	pointer-events none

	&.tweaking
		width calc(var(--tq-input-height) - 4px)

	:checked + &
		left calc(100% - var(--tq-input-height) + 4px)
		background-color var(--tq-color-background)

		&.tweaking
			left calc(100% - var(--tq-input-height))
.input
	position absolute
	opacity 0
	pointer-events none

	&:focus
		pointer-events auto
</style>
