<script setup lang="ts">
import {TweeqProvider} from '../TweeqProvider'
import {Viewport} from '../Viewport'
import type {AppProps} from './types'

const props = withDefaults(defineProps<AppProps>(), {
	appId: 'app',
	withProvider: true,
	embedded: false,
})

defineSlots<{
	title: () => unknown
	default: () => unknown
}>()
</script>

<template>
	<TweeqProvider
		v-if="props.withProvider"
		:app-id="props.appId"
		:color-mode="props.colorMode"
		:accent-color="props.accentColor"
		:background-color="props.backgroundColor"
		:gray-color="props.grayColor"
		:color-presets="props.colorPresets"
	>
		<Viewport
			:app-id="props.appId"
			:initialize="false"
			class="TqApp"
			:class="{embedded: props.embedded}"
			data-tq-app=""
			:data-tq-embedded="props.embedded ? '' : undefined"
			data-tq-part="root"
		>
			<slot name="title" />
			<main class="main" data-tq-part="main"><slot /></main>
		</Viewport>
	</TweeqProvider>
	<Viewport
		v-else
		:app-id="props.appId"
		class="TqApp"
		:class="{embedded: props.embedded}"
		data-tq-app=""
		:data-tq-embedded="props.embedded ? '' : undefined"
		data-tq-part="root"
	>
		<slot name="title" />
		<main class="main" data-tq-part="main"><slot /></main>
	</Viewport>
</template>
