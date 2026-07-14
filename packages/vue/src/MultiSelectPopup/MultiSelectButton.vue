<script setup lang="ts">
import {IconIndicator} from '../IconIndicator'
import {useMultiSelectStore} from '../stores/multiSelect'

const props = defineProps<{
	icon: string
	label: string
	updator: (values: number[]) => number[]
}>()

const multiSelect = useMultiSelectStore()

function edit() {
	multiSelect.updateValues(props.updator)
	multiSelect.confirmValues()
}
</script>

<template>
	<IconIndicator
		class="TqMultiSelectButton"
		:icon="icon"
		:aria-label="label"
		data-tq-multi-select-action="button"
		data-tq-part="button"
		@update:active="edit"
	/>
</template>
