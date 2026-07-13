<script setup lang="ts">
import {computed} from 'vue'

const props = defineProps<{
	src: string
}>()

const style = computed(() => {
	return {
		maskImage: `url(${props.src})`,
	}
})
</script>

<template>
	<div class="ColorIcon" :style="style" data-tq-component="color-icon" data-tq-part="root" />
</template>
