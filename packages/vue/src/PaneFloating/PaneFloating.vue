<script lang="ts" setup>
import {resizeFloatingPane} from '@tweeq/core'
import {useCssVar, useWindowSize} from '@vueuse/core'
import {computed, type Ref, useTemplateRef, watch} from 'vue'

import {Icon} from '../Icon'
import {useAppConfigStore} from '../stores/appConfig'
import {useDrag} from '../use/useDrag'
import type {PaneFloatingProps, Position} from './types'

const props = withDefaults(defineProps<PaneFloatingProps>(), {
	position: () => {
		return {
			anchor: 'right-top',
			width: 400,
			height: 400,
		}
	},
})

const emit = defineEmits<{
	'update:position': [Position]
}>()

const appConfig = useAppConfigStore()

const position = appConfig.ref(`${props.name}.position`, props.position)

const windowSize = useWindowSize()

const classes = computed(() => {
	const p = position.value
	return {
		'anchor-maximized': p.anchor === 'maximized',
		'anchor-top': p.anchor.includes('top'),
		'anchor-right': p.anchor.includes('right'),
		'anchor-bottom': p.anchor.includes('bottom'),
		'anchor-left': p.anchor.includes('left'),
		'w-minimized': 'width' in p && p.width === 'minimized',
		'h-minimized': 'height' in p && p.height === 'minimized',
	}
})

const style = computed(() => {
	const w = 'width' in position.value ? position.value.width : null
	const h = 'height' in position.value ? position.value.height : null
	return {
		width: typeof w === 'number' ? w + 'px' : '',
		height: typeof h === 'number' ? h + 'px' : '',
	}
})

const $root = useTemplateRef('$root')
const $top = useTemplateRef('$top')
const $right = useTemplateRef('$right')
const $left = useTemplateRef('$left')
const $bottom = useTemplateRef('$bottom')

const titlebarHeight = useCssVar('--titlebar-area-height')
const maxHeight = computed(
	() =>
		windowSize.height.value - Number.parseFloat(titlebarHeight.value || '0')
)

watch([windowSize.width, maxHeight], ([width, height]) => {
	let next = position.value
	if ('width' in next && typeof next.width === 'number' && next.width > width) {
		next = {...next, width}
	}
	if (
		'height' in next &&
		typeof next.height === 'number' &&
		next.height > height
	) {
		next = {...next, height}
	}
	if (next !== position.value) position.value = next
})

function installResize(
	target: Ref<HTMLElement | null>,
	axis: 'width' | 'height',
	edge: 'near' | 'far'
) {
	let sizeAtDragStart = 0
	useDrag(target, {
		dragDelaySeconds: 0,
		onDragStart() {
			const bounds = $root.value?.getBoundingClientRect()
			sizeAtDragStart = axis === 'width' ? bounds?.width ?? 0 : bounds?.height ?? 0
		},
		onDrag({xy, initial}) {
			const movement = axis === 'width' ? xy[0] - initial[0] : xy[1] - initial[1]
			const current = Math.round(
				sizeAtDragStart + movement * (edge === 'near' ? -1 : 1)
			)
			position.value = resizeFloatingPane({
				position: position.value,
				axis,
				edge,
				current,
				viewport: axis === 'width' ? windowSize.width.value : maxHeight.value,
			})
		},
	})
}

installResize($left, 'width', 'near')
installResize($right, 'width', 'far')
installResize($top, 'height', 'near')
installResize($bottom, 'height', 'far')

watch(position, position => emit('update:position', position))
</script>

<template>
	<div
		ref="$root"
		class="TqPaneFloating"
		:class="classes"
		:style="style"
		data-tq-part="root"
	>
		<div ref="$top" class="resize top" data-tq-part="top" />
		<div ref="$right" class="resize right" data-tq-part="right" />
		<div ref="$left" class="resize left" data-tq-part="left" />
		<div ref="$bottom" class="resize bottom" data-tq-part="bottom" />
		<Icon v-if="icon" class="minimized-title" :icon="icon" />
		<div class="wrapper">
			<div class="content">
				<slot />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>

.TqPaneFloating
	pane-style()
	--resize-width var(--tq-rem)
	--border 5px

	--br-top-left var(--tq-radius-pane)
	--br-top-right var(--tq-radius-pane)
	--br-bottom-right var(--tq-radius-pane)
	--br-bottom-left var(--tq-radius-pane)

	position fixed
	border-width 1px
	border-radius var(--br-top-left) var(--br-top-right) var(--br-bottom-right) var(--br-bottom-left)
	display grid
	grid-template-columns 1fr
	grid-template-rows 1fr
	hover-transition(border-radius, border-color)
	z-index 101
	top var(--app-margin-top)
	right 0
	bottom 0
	left 0

	&:has(.resize:hover)
		border-color var(--tq-color-accent)

	&.anchor-maximized
		--br-bottom-right 0px
		--br-bottom-left 0px

	&.anchor-left
		--br-top-left 0px
		--br-bottom-left 0px
		border-left-color transparent !important

	&.anchor-right
		--br-top-right 0px
		--br-bottom-right 0px
		border-right-color transparent !important

	&.anchor-bottom
		--br-bottom-left 0px
		--br-bottom-right 0px
		border-bottom-color transparent !important

	&.w-minimized, &.h-minimized
		background var(--tq-color-accent-hover)
		hover-transition(width, height, background)

		.minimized-title
			opacity 1
		.content
			opacity 0

	&.w-minimized
		width var(--tq-rem)

	&.h-minimized
		height var(--tq-rem)

	&.anchor-top
		bottom unset

		.top
			display none

	&.anchor-right
		left unset

		.right
			display none

	&.anchor-bottom
		top unset

		.bottom
			display none

	&.anchor-left
		right unset

		.left
			display none

.resize
	position absolute
	z-index 10
	hover-transition()

	&:before
		content ''
		position absolute
		width 100%
		height 100%
		background var(--tq-color-accent)
		hover-transition()
		opacity 0

	&:hover:before
			opacity 1
			transition opacity var(-tq-transition-duration) ease


.top, .bottom
	cursor row-resize
	height var(--resize-width)

	&:before
		height var(--border)

.top
	left var(--br-top-left)
	right var(--br-top-right)
	top calc(-0.5 * var(--resize-width))
	&:before
		top calc(50%)
.bottom
	left var(--br-bottom-left)
	right var(--br-bottom-right)
	bottom calc(-0.5 * var(--resize-width))
	&:before
		bottom calc(50%)

.left, .right
	width var(--resize-width)
	cursor col-resize

	&:before
		width var(--border)

.left
	top var(--br-top-left)
	bottom var(--br-bottom-left)
	left calc(-0.5 * var(--resize-width))
	&:before
		left calc(50%)

.right
	top var(--br-top-right)
	bottom var(--br-bottom-right)
	right calc(-0.5 * var(--resize-width))
	&:before
		right calc(50%)

.minimized-title
	position absolute
	top 50%
	left 50%
	transform translate(-50%, -50%)
	pointer-events none
	opacity 0
	color var(--tq-color-on-accent)
	hover-transition(opacity)

.wrapper
	position relative
	height 100%
	overflow-y scroll
	scroll-fade-mask()

.content
	padding var(--tq-pane-padding) calc(var(--tq-pane-padding) - var(--tq-scrollbar-width)) var(--tq-pane-padding) var(--tq-pane-padding)
	position relative
	height 100%
	hover-transition(opacity)
</style>
