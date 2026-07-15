<script setup lang="ts">
import {Icon} from '../Icon'
import {vTooltip} from '../Tooltip'
import type {ParameterProps} from './types'

defineProps<ParameterProps>()

defineSlots<{
	default: void
	label: void
}>()
</script>
<template>
	<li class="TqParameter" data-tq-component="parameter" data-tq-part="root">
		<!--
			`hint` is forwarded straight to v-tooltip: a bare string shows as plain
			text (the un-abbreviated term, e.g. "Apr." → "Aperture"), while an object
			like {title, description} opts into the structured two-line layout.
		-->
		<div class="label" v-tooltip="hint" data-tq-part="label">
			<slot name="label">
				<Icon v-if="icon" class="icon" :icon="icon" data-tq-part="icon" />
				<template v-if="label">{{ label }}</template>
			</slot>
		</div>
		<div class="input" data-tq-part="input">
			<slot />
		</div>
	</li>
</template>
