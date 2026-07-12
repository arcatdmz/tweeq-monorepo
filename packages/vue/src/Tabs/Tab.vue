<script setup lang="ts">
import {normalizeTabId} from '@tweeq/core'
import {computed, onBeforeMount, onBeforeUnmount, watch} from 'vue'

import {AddTabKey, DeleteTabKey, TabsProviderKey, UpdateTabKey} from './symbols'
import {injectStrict} from './utils'

type Props = {
	id?: string
	name: string
	isDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	id: undefined,
	isDisabled: false,
})

const tabsProvider = injectStrict(TabsProviderKey)
const addTab = injectStrict(AddTabKey)
const updateTab = injectStrict(UpdateTabKey)
const deleteTab = injectStrict(DeleteTabKey)

const id = computed(() =>
	props.id ? props.id : normalizeTabId(props.name)
)
const paneId = computed(() => id.value + '-pane')
const isActive = computed(() => id.value === tabsProvider.activeId)

const descriptor = () => ({
	name: props.name,
	isDisabled: props.isDisabled,
	id: id.value,
	paneId: paneId.value,
})

watch([id, () => props.name, () => props.isDisabled], ([nextId], [oldId]) => {
	if (oldId && oldId !== nextId) {
		deleteTab(oldId)
		addTab(descriptor())
	} else {
		updateTab(nextId, {
			name: props.name,
			isDisabled: props.isDisabled,
			id: nextId,
			paneId: paneId.value,
		})
	}
})

onBeforeMount(() => addTab(descriptor()))

onBeforeUnmount(() => {
	deleteTab(id.value)
})
</script>

<template>
	<section
		:id="paneId"
		ref="tab"
		class="TqTab"
		:class="{active: isActive}"
		:data-tab-id="id"
		:data-tq-part="`panel-${id}`"
		:aria-hidden="!isActive"
		role="tabpanel"
		tabindex="-1"
	>
		<slot />
	</section>
</template>

<style lang="stylus" scoped>

// Panels stack in one grid cell (parent sizes to the tallest tab, so the modal
// never jumps on switch); the inactive ones stay laid out but hidden.
.TqTab
	height 100%

	// opacity (not visibility) because Monaco sets `visibility: visible` on its
	// own layers, which would override an inherited `visibility: hidden` and show
	// through. opacity can't be overridden by a descendant, and keeps the panel
	// laid out so the wrapper still sizes to the tallest tab.
	&:not(.active)
		opacity 0
		pointer-events none
</style>
