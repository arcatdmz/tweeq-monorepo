<script setup lang="ts">
import {computed, inject} from 'vue'

import {DefaultColorPresets, InputColorPresetsKey} from './useInputColor'

interface Props {
	presets?: string[]
	disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	presets: () => [],
})

const emit = defineEmits<{
	'update:modelValue': [string]
}>()

const injectedPresets = inject(InputColorPresetsKey, DefaultColorPresets)
const presetsMerged = computed(() => [...injectedPresets, ...props.presets])
</script>

<template>
	<div
		class="TqInputColorPresets"
		data-tq-component="input-color-presets"
		data-tq-part="presets"
	>
		<button
			v-for="(preset, index) in presetsMerged"
			:key="`${preset}-${index}`"
			type="button"
			:disabled="props.disabled"
			:aria-label="`Use ${preset}`"
			:data-tq-part="`preset-${index}`"
			:style="{background: preset}"
			@click="emit('update:modelValue', preset)"
		/>
	</div>
</template>
./useInputColor
