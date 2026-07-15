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
		:style="style"
		data-tq-component="pane-floating"
		:data-tq-anchor="position.anchor"
		:data-tq-anchor-maximized="position.anchor === 'maximized' ? '' : undefined"
		:data-tq-anchor-top="position.anchor.includes('top') ? '' : undefined"
		:data-tq-anchor-right="position.anchor.includes('right') ? '' : undefined"
		:data-tq-anchor-bottom="position.anchor.includes('bottom') ? '' : undefined"
		:data-tq-anchor-left="position.anchor.includes('left') ? '' : undefined"
		:data-tq-width-minimized="
			'width' in position && position.width === 'minimized' ? '' : undefined
		"
		:data-tq-height-minimized="
			'height' in position && position.height === 'minimized' ? '' : undefined
		"
		data-tq-part="root"
	>
		<div ref="$top" data-tq-resize-edge="top" data-tq-part="top" />
		<div ref="$right" data-tq-resize-edge="right" data-tq-part="right" />
		<div ref="$left" data-tq-resize-edge="left" data-tq-part="left" />
		<div ref="$bottom" data-tq-resize-edge="bottom" data-tq-part="bottom" />
		<Icon v-if="icon" data-tq-part="minimized-title" :icon="icon" />
		<div data-tq-part="wrapper">
			<div data-tq-part="content">
				<slot />
			</div>
		</div>
	</div>
</template>
