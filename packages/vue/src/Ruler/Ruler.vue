<script setup lang="ts">
import {
	getRulerDefaultScales,
	getRulerPixelsPerUnit,
	getRulerScaleOffset,
	getRulerValueAtPixel,
	type RulerScale,
} from '@tweeq/core'
import {type MaybeElementRef, useElementBounding} from '@vueuse/core'
import * as Bndr from 'bndr-js'
import {type vec2} from 'linearly'
import {computed, ref} from 'vue'

import {useBndr} from '../use/useBndr'

const props = defineProps<{
	range: vec2
	scales?: RulerScale[]
}>()

const emit = defineEmits<{
	drag: [value: number]
}>()

const $root: MaybeElementRef = ref(null)

const {width: rootWidth} = useElementBounding($root)

const pixelsPerUnit = computed(
	() => getRulerPixelsPerUnit(rootWidth.value, props.range)
)

const rootStyle = computed(() => ({
	'background-size': `${pixelsPerUnit.value}px 100%`,
	'background-position': `${-props.range[0] * pixelsPerUnit.value}px 0`,
}))

const _scales = computed<RulerScale[]>(() => {
	return props.scales ?? getRulerDefaultScales(props.range)
})

function scaleToStyle(scale: RulerScale) {
	return {
		transform: `translateX(${toPixels(scale.value)}px)`,
		opacity: scale.opacity ?? 1,
	}
}

function toPixels(value: number) {
	return getRulerScaleOffset(value, props.range, pixelsPerUnit.value)
}

useBndr($root, el => {
	Bndr.pointer(el)
		.drag({pointerCapture: true, coordinate: 'offset'})
		.on(d => {
			const x = d.current[0]
			const value = getRulerValueAtPixel(x, rootWidth.value, props.range)
			emit('drag', value)
		})
})
</script>
<template>
	<div ref="$root" class="TqRuler" :style="rootStyle" data-tq-part="root">
		<div class="content" data-tq-part="content">
			<slot />
		</div>
		<div
			v-for="scale in _scales"
			:key="scale.value"
			class="scale"
			:style="scaleToStyle(scale)"
			data-tq-part="scale"
		>
			{{ scale.label ?? scale.value }}
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.TqRuler
	position relative
	background-image linear-gradient(to right, var(--tq-color-border) 1px, transparent 1px)

.content, .scale
	position absolute
	inset 0

.scale
	pointer-events none
	border-left 1px solid var(--tq-color-text-mute)
	font-size 9px
	color var(--tq-color-text-mute)
	text-indent 0.4em
</style>
