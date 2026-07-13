<template>
	<svg
		class="TqSvgIcon"
		data-tq-component="svg-icon"
		:data-tq-mode="mode"
		:data-tq-non-stroke-scaling="nonStrokeScaling ? '' : undefined"
		xmlns="http://www.w3.org/2000/svg"
		:class="{
			inline: mode === 'inline',
			block: mode === 'block',
			'non-stroke-scaling': nonStrokeScaling,
		}"
		viewBox="0 0 32 32"
		width="32"
		height="32"
		:style="{strokeWidth}"
	>
		<slot />
	</svg>
</template>

<script lang="ts">
import {defineComponent, type PropType} from 'vue'

export default defineComponent({
	name: 'SvgIcon',
	props: {
		mode: {
			type: String as PropType<'inline' | 'block'>,
			default: 'inline',
		},
		strokeWidth: {
			type: Number,
		},
		nonStrokeScaling: {
			type: Boolean,
		},
	},
})
</script>
