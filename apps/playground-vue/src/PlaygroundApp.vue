<script setup lang="ts">
import {TweeqProvider, Viewport} from '@tweeq/vue'

import ComponentGallery from './ComponentGallery.vue'
import ResearchApp from './ResearchApp.vue'

const research = window.location.hash === '#/research'
</script>

<template>
	<TweeqProvider app-id="com.tweeq.playground-vue">
		<Viewport v-if="research"><ResearchApp /></Viewport>
		<ComponentGallery v-else />
	</TweeqProvider>
</template>
