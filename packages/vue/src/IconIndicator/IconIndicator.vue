<script lang="ts" setup>
import {Icon} from '../Icon'
import {IconIndicatorProps} from './types'

const props = withDefaults(defineProps<IconIndicatorProps>(), {interactive: true})

const emit = defineEmits<{
	'update:active': [boolean]
}>()

function toggle() {
	if (!props.interactive) return
	emit('update:active', !props.active)
}
</script>

<template>
	<div
		class="IconIndicator"
		:class="{active: active, inactive: active === false, inline}"
		:role="interactive ? 'button' : 'presentation'"
		:tabindex="interactive ? 0 : -1"
		:aria-pressed="interactive ? active : undefined"
		:aria-hidden="interactive ? undefined : true"
		data-tq-component="icon-indicator"
		:data-inline="inline || undefined"
		data-tq-part="root"
		@click="toggle"
		@keydown.enter="interactive && ($event.preventDefault(), toggle())"
		@keydown.space="interactive && ($event.preventDefault(), toggle())"
	>
		<Icon v-if="icon" class="icon" :icon="icon" data-tq-part="icon" />
	</div>
</template>
