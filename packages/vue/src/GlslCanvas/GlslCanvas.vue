<script lang="ts" setup>
import {drawGlslToImage, type GlslUniforms} from '@tweeq/dom'
import {useResizeObserver} from '@vueuse/core'
import {onUnmounted, useTemplateRef, watch} from 'vue'

interface Props {
	fragmentString: string
	uniforms: GlslUniforms
}

const props = withDefaults(defineProps<Props>(), {
	fragmentString: `
		precision mediump float;
		varying vec2 uv;
		void main() { gl_FragColor = vec4(uv, 0, 1); }`,
	uniforms: () => ({}),
})

const $img = useTemplateRef('$img')

let cancelDraw: (() => void) | undefined
function draw() {
	cancelDraw?.()
	if ($img.value) {
		cancelDraw = drawGlslToImage(
			$img.value,
			props.fragmentString,
			props.uniforms
		)
	}
}

watch(
	() => [props.fragmentString, props.uniforms] as const,
	draw,
	{immediate: true, flush: 'post'}
)
useResizeObserver($img, draw)
onUnmounted(() => cancelDraw?.())
</script>

<template>
	<img ref="$img" class="GlslCanvas" alt="" data-tq-part="image" />
</template>

<style lang="stylus" scoped>

.GlslCanvas
	pointer-events none
</style>
