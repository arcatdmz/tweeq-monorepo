<script lang="ts" setup>
import {Icon} from '../Icon'
import {IconIndicatorProps} from './types'

const props = defineProps<IconIndicatorProps>()

const emit = defineEmits<{
	'update:active': [boolean]
}>()

function toggle() {
	emit('update:active', !props.active)
}
</script>

<template>
	<div
		class="IconIndicator"
		:class="{active: active, inactive: active === false, inline}"
		role="button"
		tabindex="0"
		:aria-pressed="active"
		data-tq-part="root"
		@click="toggle"
		@keydown.enter.prevent="toggle"
		@keydown.space.prevent="toggle"
	>
		<Icon v-if="icon" class="icon" :icon="icon" data-tq-part="icon" />
	</div>
</template>

<style lang="stylus" scoped>

.IconIndicator
	--size var(--tq-input-height)
	height var(--size)
	width var(--size)
	display flex
	align-items center
	justify-content center
	hover-transition(color)
	border-radius 9999px
	color var(--tq-color-text)

	// Inline variant: shrink to the nested icon size so it sits naturally next
	// to text instead of occupying a full input slot.
	&.inline
		--size var(--tq-icon-size)

	&.inactive
		color var(--tq-color-text-mute)
	&.active
		color var(--tq-color-accent)

	.icon
		display block
		height calc(var(--size) - 2px)
		width calc(var(--size) - 2px)
</style>
