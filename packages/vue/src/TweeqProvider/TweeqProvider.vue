<script lang="ts" setup>
import {createTweeqRuntime} from '@tweeq/dom'
import {onBeforeUnmount, onMounted, watch} from 'vue'

import {CommandPalette} from '../CommandPalette'
import {useInputColor} from '../InputColor/useInputColor'
import {MultiSelectPopup} from '../MultiSelectPopup'
import {PaneModalComplex} from '../PaneModalComplex'
import {PaneModalTabs} from '../PaneModalTabs'
import {TooltipRoot} from '../Tooltip'
import {provideTweeqRuntime} from '../runtime'
import type {TweeqProviderProps} from './types'

const props = withDefaults(defineProps<TweeqProviderProps>(), {appId: 'app'})
const runtime = createTweeqRuntime({
	appId: props.appId,
	colorMode: props.colorMode,
	accentColor: props.accentColor,
	backgroundColor: props.backgroundColor,
	grayColor: props.grayColor,
})
provideTweeqRuntime(runtime)
useInputColor(props.colorPresets)
watch(
	() => [
		props.appId,
		props.colorMode,
		props.accentColor,
		props.backgroundColor,
		props.grayColor,
	],
	() => runtime.configure(props.appId, props)
)
let unbind: (() => void) | undefined
onMounted(() => {
	unbind = runtime.bind()
})
onBeforeUnmount(() => {
	unbind?.()
	runtime.dispose()
})

defineSlots<{default: () => unknown}>()
</script>

<template>
	<slot />
	<MultiSelectPopup />
	<CommandPalette />
	<PaneModalComplex />
	<PaneModalTabs />
	<TooltipRoot />
</template>
