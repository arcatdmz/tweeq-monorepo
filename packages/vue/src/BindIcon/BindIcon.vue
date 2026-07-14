<script setup lang="ts">
import type {IconSequence} from 'bndr-js'

import {Icon} from '../Icon'

export interface BindIconProps {
	icon: IconSequence
}

defineProps<BindIconProps>()
</script>

<template>
	<div class="BindIcon" data-tq-component="bind-icon" data-tq-part="root">
		<template v-for="(ic, index) in icon" :key="index">
			<span v-if="typeof ic === 'string'">{{ ic }}</span>
			<Icon class="icon" v-else-if="ic.type === 'iconify'" :icon="ic.icon" data-tq-part="icon" />
		</template>
	</div>
</template>
