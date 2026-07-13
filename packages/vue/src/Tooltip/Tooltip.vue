<script lang="ts" setup>
defineSlots<{
	default: () => any
}>()
</script>

<template>
	<div class="TqTooltip" data-tq-component="tooltip">
		<slot />
	</div>
</template>
