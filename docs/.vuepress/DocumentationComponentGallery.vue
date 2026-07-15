<script setup lang="ts">
import {TweeqProvider} from '@tweeq/vue'

import ComponentGallery from '../../apps/playground-vue/src/ComponentGallery.vue'

defineProps<{embeddedDocs?: boolean}>()
</script>

<template>
	<TweeqProvider app-id="vue-docs-gallery">
		<ComponentGallery embedded-docs />
	</TweeqProvider>
</template>
