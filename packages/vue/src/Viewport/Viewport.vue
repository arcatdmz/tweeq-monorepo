<script lang="ts" setup>
import {initTweeq} from '../useTweeq'

const props = withDefaults(
	defineProps<{appId?: string; initialize?: boolean}>(),
	{appId: 'viewport', initialize: true}
)
if (props.initialize) initTweeq(props.appId)
</script>

<template>
	<div class="TqViewport" data-tq-component="viewport" data-tq-part="viewport">
		<slot />
	</div>
</template>

<style lang="stylus">
// Global (non-scoped) so scroll-fade-mask()'s keyframe names resolve everywhere.
scroll-fade-globals()
</style>
