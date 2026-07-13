<script lang="ts" setup>
import {useResizeObserver} from '@vueuse/core'
import {computed, nextTick, ref, watch} from 'vue'

import {Icon} from '../Icon'
import {vTooltip} from '../Tooltip'
import {useFlash} from '../use/useFlash'
import type {InputButtonProps} from './types'

const props = defineProps<InputButtonProps>()

// Imperative attention flash: a parent grabs this button via a template ref and
// calls `.flash()` to pulse it (e.g. to point the eye at the next action).
const {flashing, flash} = useFlash()

defineExpose({flash})

// Keep icon + label on one line; when the button is squeezed narrower than its
// content the label clips to an ellipsis (see CSS). Detect that clip and surface
// the full text as a tooltip so nothing becomes unreadable. An explicit
// `tooltip` prop always wins over this fallback.
const $label = ref<HTMLSpanElement>()
const truncated = ref(false)

function measure() {
	const el = $label.value
	truncated.value = el ? el.scrollWidth > el.clientWidth + 0.5 : false
}

// ResizeObserver catches the squeeze/grow; the watch catches a label text swap
// that changes truncation without changing the (clipped) box size.
useResizeObserver($label, measure)
watch(
	() => props.label,
	() => nextTick(measure)
)

const tooltipContent = computed(
	() => props.tooltip ?? (truncated.value ? props.label : undefined)
)
</script>

<template>
	<button
		class="TqInputButton"
		:class="{blink, subtle, narrow, flashing}"
		:inline-position="inlinePosition"
		:block-position="blockPosition"
		:disabled="disabled"
		:aria-invalid="invalid || undefined"
		data-tq-component="input-button"
		:data-blink="blink || undefined"
		:data-subtle="subtle || undefined"
		:data-narrow="narrow || undefined"
		:data-flashing="flashing || undefined"
		data-tq-part="root"
		v-tooltip="tooltipContent"
		@mousedown.prevent
	>
		<!--
			Keep this comment INSIDE <button> so the template stays single-root. A
			leading sibling comment makes this component's $el resolve to the comment
			node instead of the <button>, breaking callers that read $el as the
			element (e.g. anchoring a Popover to it).

			@mousedown.prevent stops a mouse click from focusing the button (the
			click still fires). Otherwise the button keeps focus after a click and a
			later Enter/Space re-activates it unexpectedly. Keyboard (Tab) focus is
			unaffected, so keyboard activation still works — matching :focus-visible.
		-->
		<Icon v-if="icon" class="icon" :icon="icon" data-tq-part="icon" />
		<span v-if="label" ref="$label" class="label" data-tq-part="label">{{ label }}</span>
		<span v-if="chevron" class="chevron" data-tq-part="chevron">
			<Icon icon="mdi:chevron-down" />
		</span>
	</button>
</template>
