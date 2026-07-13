<script setup lang="ts">
import {Icon as Iconify} from '@iconify/vue'
import {parseIcon} from '@tweeq/core'
import {computed, watchEffect} from 'vue'

import {rememberIcon} from './iconCache'

const props = defineProps<{
	icon: string
}>()

const icon = computed(() => parseIcon(props.icon))

// Persist iconify icons to localStorage so they're in memory (no async-resolve
// flash) on the next reload.
watchEffect(() => {
	if (icon.value.type === 'iconify') rememberIcon(icon.value.value)
})

defineOptions({
	inheritAttrs: false,
})
</script>

<template>
	<Iconify
		v-if="icon.type === 'iconify'"
		class="TqIcon iconify"
		:icon="icon.value"
		v-bind="$attrs"
		data-tq-component="icon"
		data-tq-variant="iconify"
	/>
	<div
		v-else-if="icon.type === 'char'"
		class="TqIcon char"
		v-bind="$attrs"
		data-tq-component="icon"
		data-tq-variant="char"
	>
		{{ icon.value }}
	</div>
	<svg
		v-else-if="icon.type === 'fill'"
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		class="TqIcon fill"
		v-bind="$attrs"
		data-tq-component="icon"
		data-tq-variant="fill"
	>
		<path fill="currentColor" :d="icon.value" />
	</svg>
</template>
