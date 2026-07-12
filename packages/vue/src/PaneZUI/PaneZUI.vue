<script setup lang="ts">
import {
	getZuiDotState,
	getZuiVisibleRect,
	type Rect,
} from '@tweeq/core'
import {useElementBounding} from '@vueuse/core'
import {mat2d, type vec2} from 'linearly'
import {computed, shallowRef, useTemplateRef, watch, watchEffect} from 'vue'

import {useZUI} from '../use/useZUI'

const props = defineProps<{
	transform?: mat2d
	background?: 'dots'
}>()

const emit = defineEmits<{
	'update:transform': [mat2d]
	'update:visibleRect': [Rect]
	'update:size': [vec2]
}>()

const $root = useTemplateRef('$root')

const {width: rootWidth, height: rootHeight} = useElementBounding($root)

const transformLocal = shallowRef(props.transform ?? mat2d.I)

const size = computed<vec2>(() => {
	return [rootWidth.value, rootHeight.value]
})

watchEffect(() => {
	emit('update:size', size.value)
})

watch(
	() => props.transform,
	transform => {
		transformLocal.value = transform ?? mat2d.I
	},
	{immediate: true}
)

watch(transformLocal, local => {
	if (local === props.transform) return
	emit('update:transform', local)
})

watchEffect(() => {
	emit('update:visibleRect', getZuiVisibleRect(transformLocal.value, size.value))
})

useZUI($root, delta => {
	transformLocal.value = mat2d.mul(delta, transformLocal.value)
})

const dotStyles = computed(() => {
	const dots = getZuiDotState(transformLocal.value)

	return {
		opacity: `${dots.opacity * 100}%`,
		backgroundPosition: `${dots.position[0]}px ${dots.position[1]}px`,
		backgroundSize: `${dots.size[0]}px ${dots.size[1]}px`,
	}
})

const transformStyles = computed(() => {
	return {
		transform: `matrix(${transformLocal.value.join(',')})`,
	}
})
</script>

<template>
	<div
		ref="$root"
		class="TqPaneZUI"
		:class="{dots: background === 'dots'}"
		data-tq-part="root"
	>
		<div v-if="background === 'dots'" class="dots" :style="dotStyles" />
		<div class="transform" :style="transformStyles" data-tq-part="transform">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>

.TqPaneZUI
	position relative
	overflow hidden
	width 100%
	height 100%

.dots
	position absolute
	inset 0
	background-image radial-gradient(
		circle at top left,
		var(--tq-color-text-mute) 1px,
		transparent 1px)

.transform
	position absolute
	transform-origin 0 0
	pointer-events none

	& > *
		pointer-events auto
</style>
