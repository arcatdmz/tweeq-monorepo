<script lang="ts" setup>
import {type BalloonArrowSide, getBalloonGeometry} from '@tweeq/core'
import {useElementSize} from '@vueuse/core'
import {computed, useTemplateRef} from 'vue'

const props = withDefaults(
	defineProps<{
		// Edge the arrow protrudes from. Omit for a plain (arrowless) balloon.
		arrowSide?: BalloonArrowSide | null
		// Arrow centre in px along that edge, measured from the box's top-left
		// (x for top/bottom, y for left/right). Clamped to the straight run.
		arrowOffset?: number
		radius?: number
		// Inner padding around the slotted content.
		padding?: string
		// Attention flash: pulse the whole balloon (scale + accent drop-shadow +
		// glowing border). Driven by a boolean so re-arming restarts the keyframes.
		flash?: boolean
	}>(),
	{
		arrowSide: null,
		arrowOffset: 0,
		flash: false,
		// Concentric with the content: inner control radius (4) + popup padding
		// (9), matching --tq-radius-popup.
		radius: 13,
		padding: 'var(--tq-popup-padding)',
	}
)

const $content = useTemplateRef<HTMLElement>('$content')
const {width, height} = useElementSize(
	$content,
	{width: 0, height: 0},
	{box: 'border-box'}
)

const geometry = computed(() =>
	getBalloonGeometry(width.value, height.value, {
		arrowSide: props.arrowSide,
		arrowOffset: props.arrowOffset,
		radius: props.radius,
	})
)
</script>

<template>
	<div
		class="TqBalloon"
		data-tq-component="balloon"
		data-tq-balloon=""
		:class="{flash}"
		:data-tq-flash="flash ? '' : undefined"
		:style="[
			geometry.wrapperPadding,
			{transformOrigin: geometry.transformOrigin},
		]"
	>
		<div
			class="fill"
			data-tq-part="fill"
			:style="{
				clipPath: geometry.path ? `path('${geometry.path}')` : undefined,
			}"
		/>
		<svg
			class="stroke"
			data-tq-part="stroke"
			:viewBox="`0 0 ${geometry.layerWidth} ${geometry.layerHeight}`"
			:width="geometry.layerWidth"
			:height="geometry.layerHeight"
		>
			<path :d="geometry.path" />
		</svg>
		<div
			ref="$content"
			class="content"
			data-tq-part="content"
			:style="{padding}"
		>
			<slot />
		</div>
	</div>
</template>
