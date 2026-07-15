<script setup lang="ts">
import {useRoute, useSiteData} from '@vuepress/client'
import {computed, onMounted, ref} from 'vue'

const route = useRoute()
const site = useSiteData()
const mounted = ref(false)
onMounted(() => {
	mounted.value = true
})

const href = computed(() => {
	const reactBase = site.value.base.replace(/vue\/$/, '')
	const file = route.path === '/' ? '' : route.path.replace(/^\//, '')
	return `${reactBase}${file}${route.hash}`
})
</script>

<template>
	<Teleport v-if="mounted" to=".vp-navbar-items-wrapper">
		<div class="vp-navbar-item renderer-page-switch">
			<a class="auto-link" :href="href">React</a>
		</div>
	</Teleport>
</template>
