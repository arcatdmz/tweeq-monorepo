<script setup lang="ts">
import {
	type MarkdownRenderOptions,
	renderMarkdown,
} from '@tweeq/core'
import {computed} from 'vue'

const props = withDefaults(
	defineProps<MarkdownRenderOptions & {source?: string}>(),
	{
	source: '',
	anchor: () => ({}),
	breaks: false,
	html: false,
	langPrefix: 'language-',
	linkify: false,
	toc: () => ({}),
	}
)

const rendered = computed(() => renderMarkdown(props.source, props))
</script>

<template>
	<div class="MarkdownIt" data-tq-part="root" v-html="rendered" />
</template>
