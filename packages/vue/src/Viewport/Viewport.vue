<script lang="ts" setup>
import {createTweeqRuntime} from '@tweeq/dom'
import {onBeforeUnmount, onMounted} from 'vue'

import {
	provideTweeqRuntime,
	useOptionalTweeqRuntime,
} from '../runtime'

const props = withDefaults(
	defineProps<{appId?: string; initialize?: boolean}>(),
	{appId: 'viewport', initialize: true}
)
const parentRuntime = useOptionalTweeqRuntime()
const runtime = parentRuntime ?? createTweeqRuntime({appId: props.appId})
if (!parentRuntime) provideTweeqRuntime(runtime)
let unbind: (() => void) | undefined
onMounted(() => {
	if (!parentRuntime && props.initialize) unbind = runtime.bind()
})
onBeforeUnmount(() => {
	if (!parentRuntime) {
		unbind?.()
		runtime.dispose()
	}
})
</script>

<template>
	<div class="TqViewport" data-tq-component="viewport" data-tq-part="viewport">
		<slot />
	</div>
</template>
