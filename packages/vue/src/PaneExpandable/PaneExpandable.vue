<script setup lang="ts">
import {computed, getCurrentInstance, ref, useTemplateRef} from 'vue'

import {Icon} from '../Icon'
import {Popover} from '../Popover'
import type {PaneExpandableProps} from './types'

const props = withDefaults(defineProps<PaneExpandableProps>(), {
	openIcon: 'mdi:close',
	placement: 'bottom-end',
	arrow: true,
	persistent: false,
})

const emit = defineEmits<{
	'update:open': [boolean]
	expand: []
	collapse: []
}>()

defineSlots<{default: () => any}>()

const $button = useTemplateRef<HTMLElement>('$button')

const internalOpen = ref(false)
const vnodeProps = getCurrentInstance()?.vnode.props
const controlled = Boolean(vnodeProps && 'open' in vnodeProps)

const open = computed<boolean>({
	get: () => (controlled ? Boolean(props.open) : internalOpen.value),
	set(value) {
		if (open.value === value) return
		if (!controlled) internalOpen.value = value
		emit('update:open', value)
		if (value) emit('expand')
		else emit('collapse')
	},
})

// Tracks hover over the round button. While open, the icon swaps to the
// collapse affordance (openIcon) only on hover — when not hovering, the button
// keeps showing its resting `icon`, so an expanded pane reads as itself rather
// than as a chevron.
const hovering = ref(false)

// Hover opens; it deliberately does NOT close on leave. A click on the button
// explicitly toggles. Dismissal is otherwise the native popover light-dismiss
// (an outside pointerdown) or Esc. A persistent pane opts out of both: it never
// hovers open and never light-dismisses, so the click is the only toggle.
function onPointerEnter() {
	hovering.value = true
	if (props.persistent) return
	open.value = true
}

function onPointerLeave() {
	hovering.value = false
}

// While open, reveal the collapse icon only on hover; otherwise keep `icon`.
const displayIcon = computed(() =>
	open.value && hovering.value ? props.openIcon : props.icon
)

// The button sits outside the popover, so a click on it while open ALSO triggers
// the native light-dismiss (which closes it and stamps this). Without the guard
// the click handler would immediately reopen what the dismiss just closed.
let lastDismissAt = 0

function onClick() {
	if (performance.now() - lastDismissAt < 200) return
	open.value = !open.value
}

function onPopoverUpdateOpen(value: boolean) {
	if (!value) lastDismissAt = performance.now()
	open.value = value
}
</script>

<template>
	<div
		class="TqPaneExpandable"
		data-tq-component="pane-expandable"
		data-tq-part="root"
	>
		<button
			ref="$button"
			class="button"
			:class="{open}"
			type="button"
			:aria-expanded="open"
			data-tq-part="trigger"
			@pointerenter="onPointerEnter"
			@pointerleave="onPointerLeave"
			@click="onClick"
		>
			<Icon class="icon" :icon="displayIcon" data-tq-part="icon" />
		</button>
		<Popover
			:reference="$button ?? null"
			:open="open"
			:placement="placement"
			:arrow="arrow"
			:light-dismiss="!persistent"
			exit-transition
			@update:open="onPopoverUpdateOpen"
		>
			<div class="content" data-tq-part="content">
				<slot />
			</div>
		</Popover>
	</div>
</template>
