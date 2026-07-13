<script setup lang="ts">
import {ref, watch} from 'vue'

import {Icon} from '../Icon'
import {useAppConfigStore} from '../stores/appConfig'
import ParameterHeading from './ParameterHeading.vue'
import {ParameterGroupProps} from './types'

const props = defineProps<ParameterGroupProps>()

defineSlots<{
	default: void
	headingRight: void
}>()

const appConfig = useAppConfigStore()

const expanded = appConfig.ref(props.name, true)

// The 0fr↔1fr collapse needs overflow:hidden to clip the content, but that also
// crops focus outlines of inputs once the group is open. So clip only while
// collapsed or mid-animation: clip immediately on collapse, then unclip once the
// expand transition finishes.
const clipped = ref(!expanded.value)

watch(expanded, expanded => {
	if (!expanded) clipped.value = true
})

function onTransitionEnd(e: TransitionEvent) {
	if (e.propertyName === 'grid-template-rows') {
		clipped.value = !expanded.value
	}
}
</script>

<template>
	<div
		class="ParameterGroup"
		:class="{collapsed: !expanded}"
		data-tq-component="parameter-group"
		:data-tq-collapsed="!expanded ? '' : undefined"
		data-tq-part="root"
		@transitionend="onTransitionEnd">
		<ParameterHeading>
			<template #default>
				<button
					type="button"
					class="heading"
					:aria-expanded="expanded"
					data-tq-part="trigger"
					@click="expanded = !expanded"
				>
					<Icon
						class="chevron"
						data-tq-part="chevron"
						icon="mdi:chevron-down"
					/>
					<Icon
						v-if="icon"
						class="group-icon"
						data-tq-part="group-icon"
						:icon="icon"
					/>
					<span>{{ label }}</span>
				</button>
			</template>
			<template #right>
				<slot v-if="expanded" name="headingRight" />
			</template>
		</ParameterHeading>
		<!-- Always rendered; the 0fr↔1fr grid-row animates the height. -->
		<div
			class="content"
			:class="{clipped}"
			data-tq-part="content"
			:data-tq-clipped="clipped ? '' : undefined"
		>
			<slot />
		</div>
	</div>
</template>
