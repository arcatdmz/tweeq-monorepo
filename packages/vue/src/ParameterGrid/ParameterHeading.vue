<script setup lang="ts">
defineSlots<{
	default: void
	right: void
}>()
</script>
<template>
	<li class="TqParameterHeading" data-tq-component="parameter-heading" data-tq-part="root">
		<div class="heading" data-tq-part="heading">
			<slot />
		</div>
		<div class="right" data-tq-part="right">
			<slot name="right" />
		</div>
	</li>
</template>
