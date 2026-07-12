<script setup lang="ts">
import {IconIndicator} from '../IconIndicator'
import {useMultiSelectStore} from '../stores/multiSelect'

const props = defineProps<{
	icon: string
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
		data-tq-part="button"
		@click="edit"
	/>
</template>

<style lang="stylus" scoped>

.TqMultiSelectButton
	border-radius var(--tq-radius-input)

	&:hover
		background var(--tq-color-input-hover)
</style>
