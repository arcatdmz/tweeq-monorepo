<script lang="ts" setup>
import {initTweeq} from '../useTweeq'
import {CommandPalette} from '../CommandPalette'
import {MultiSelectPopup} from '../MultiSelectPopup'
import {PaneModalComplex} from '../PaneModalComplex'
import {PaneModalTabs} from '../PaneModalTabs'
import {TooltipRoot} from '../Tooltip'
import type {TweeqProviderProps} from './types'

const props = withDefaults(defineProps<TweeqProviderProps>(), {appId: 'app'})
initTweeq(props.appId, props)

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
