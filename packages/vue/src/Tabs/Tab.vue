<script setup lang="ts">
import {normalizeTabId} from '@tweeq/core'
import {uniqueId} from 'lodash-es'
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
const instanceId = uniqueId('TqTab_')
const tabId = `${instanceId}_tab`
const paneId = `${instanceId}_panel`
const isActive = computed(() => id.value === tabsProvider.activeId)

const descriptor = () => ({
	name: props.name,
	isDisabled: props.isDisabled,
	id: id.value,
	tabId,
	paneId,
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
			tabId,
			paneId,
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
		:data-tq-active="isActive ? '' : undefined"
		data-tq-component="tab"
		:data-tq-part="`panel-${id}`"
		:aria-hidden="!isActive"
		:aria-labelledby="tabId"
		role="tabpanel"
		tabindex="-1"
	>
		<slot />
	</section>
</template>
