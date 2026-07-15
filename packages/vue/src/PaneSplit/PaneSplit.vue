<script setup lang="ts">
import {
	getSplitPaneSeparatorValues,
	resizeSplitPane,
	resizeSplitPaneFromKeyboard,
} from '@tweeq/core'
import {useResizeObserver} from '@vueuse/core'
import {computed, ref, useTemplateRef} from 'vue'

import {useAppConfigStore} from '../stores/appConfig'
import {useDrag} from '../use/useDrag'
import {PaneSplitProps} from './types'

const props = withDefaults(defineProps<PaneSplitProps>(), {
	size: 50,
	scroll: () => [true, true],
	min: 40,
})

const appConfig = useAppConfigStore()

const $root = useTemplateRef('$root')
const $divider = useTemplateRef('$divider')

const measurementVersion = ref(0)

const viewportSize = computed(() => {
	measurementVersion.value
	const bounds = $root.value?.getBoundingClientRect()
	return props.direction === 'horizontal'
		? bounds?.width ?? 0
		: bounds?.height ?? 0
})

function measureViewportSize() {
	measurementVersion.value++
	const bounds = $root.value?.getBoundingClientRect()
	return props.direction === 'horizontal'
		? bounds?.width ?? 0
		: bounds?.height ?? 0
}

useResizeObserver($root, () => {
	measurementVersion.value++
})

// Which pane carries the stored size. In proportional mode it's always `first`
// (a percentage); in fixed mode it's whichever pane `fixed` names (in pixels).
const sizedPane = computed(() => props.fixed ?? 'first')

// Keep px and % under different keys so toggling the mode never reads one as the
// other (a stored 50% becoming 50px, say).
const size = appConfig.ref(
	props.fixed ? `${props.name}.px` : `${props.name}.width`,
	props.size
)

const sizeStyle = computed(() => {
	const cssProp = props.direction === 'horizontal' ? 'width' : 'height'
	const unit = props.fixed ? 'px' : '%'
	return {[cssProp]: `${size.value}${unit}`}
})

const firstStyle = computed(() =>
	sizedPane.value === 'first' ? sizeStyle.value : null
)
const secondStyle = computed(() =>
	sizedPane.value === 'second' ? sizeStyle.value : null
)

const separator = computed(() =>
	getSplitPaneSeparatorValues({
		size: size.value,
		fixed: props.fixed,
		viewportSize: viewportSize.value,
		minPixelSize: props.min,
	})
)

function onDividerKeydown(event: KeyboardEvent) {
	const next = resizeSplitPaneFromKeyboard({
		current: size.value,
		key: event.key,
		direction: props.direction,
		fixed: props.fixed,
		viewportSize: measureViewportSize(),
		minPixelSize: props.min,
		largeStep: event.shiftKey,
	})
	if (next === undefined) return
	event.preventDefault()
	size.value = next
}

let sizeAtDragStart = size.value
useDrag($divider, {
	dragDelaySeconds: 0,
	onDragStart() {
		sizeAtDragStart = size.value
	},
	onDrag({xy, initial}) {
		const movement =
			props.direction === 'horizontal'
				? xy[0] - initial[0]
				: xy[1] - initial[1]
		size.value = resizeSplitPane({
			start: sizeAtDragStart,
			movement,
			fixed: props.fixed,
			viewportSize: measureViewportSize(),
			minPixelSize: props.min,
		})
	},
})
</script>

<template>
	<div
		ref="$root"
		class="TqPaneSplit"
		:class="[direction, {fixed: !!fixed}]"
		:style="{'--pane-min': min + 'px'}"
		data-tq-component="pane-split"
		:data-tq-direction="direction"
		:data-tq-fixed="fixed ? '' : undefined"
		data-tq-part="root"
	>
		<div
			class="pane"
			:class="{grow: sizedPane !== 'first'}"
			:style="firstStyle"
			data-tq-part="first"
			:data-tq-grow="sizedPane !== 'first' ? '' : undefined"
		>
			<div
				class="wrapper"
				:class="{scroll: scroll[0]}"
				data-tq-part="wrapper"
				:data-tq-scroll="scroll[0] ? '' : undefined"
			>
				<slot name="first" />
			</div>
		</div>
		<div
			ref="$divider"
			class="divider"
			role="separator"
			tabindex="0"
			:aria-label="`${name} divider`"
			:aria-orientation="direction === 'horizontal' ? 'vertical' : 'horizontal'"
			:aria-valuemin="separator.min"
			:aria-valuemax="separator.max"
			:aria-valuenow="separator.now"
			:aria-valuetext="separator.text"
			data-tq-part="divider"
			@keydown="onDividerKeydown"
		/>
		<div
			class="pane"
			:class="{grow: sizedPane !== 'second'}"
			:style="secondStyle"
			data-tq-part="second"
			:data-tq-grow="sizedPane !== 'second' ? '' : undefined"
		>
			<div
				class="wrapper"
				:class="{scroll: scroll[1]}"
				data-tq-part="wrapper"
				:data-tq-scroll="scroll[1] ? '' : undefined"
			>
				<slot name="second" />
			</div>
		</div>
	</div>
</template>
