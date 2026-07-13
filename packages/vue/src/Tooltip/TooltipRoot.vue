<script setup lang="ts">
import {computed} from 'vue'

import {Popover} from '../Popover'
import {
	setTooltipOpen,
	TOOLTIP_ANCHOR_NAME,
	tooltipReference,
	tooltipState,
} from './tooltip'

const reference = computed(() => tooltipReference.value)

// Sync back the native popover's own close (Esc / programmatic), so the shared
// state never gets stuck open.
function onUpdateOpen(open: boolean) {
	if (!open) setTooltipOpen(false)
}
</script>

<template>
	<Popover
		:reference="reference"
		:open="tooltipState.open"
		:anchor-name="TOOLTIP_ANCHOR_NAME"
		placement="top"
		:light-dismiss="false"
		arrow
		teleport=".TqViewport"
		@update:open="onUpdateOpen"
	>
		<!-- Structured: bold title + muted description (replaces "Title — sub"). -->
		<div
			v-if="tooltipState.title || tooltipState.description"
			class="TqTooltipContent structured"
			data-tq-component="tooltip-content"
			data-tq-part="tooltip-content"
			data-tq-variant="structured"
		>
			<div v-if="tooltipState.title" class="title" data-tq-part="title">
				{{ tooltipState.title }}
			</div>
			<div v-if="tooltipState.description" class="description" data-tq-part="description">
				{{ tooltipState.description }}
			</div>
		</div>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div
			v-else-if="tooltipState.html"
			class="TqTooltipContent html"
			data-tq-component="tooltip-content"
			data-tq-part="tooltip-content"
			data-tq-variant="html"
			v-html="tooltipState.content"
		/>
		<div
			v-else
			class="TqTooltipContent plain"
			data-tq-component="tooltip-content"
			data-tq-part="tooltip-content"
			data-tq-variant="plain"
		>
			{{ tooltipState.content }}
		</div>
	</Popover>
</template>
