<script setup lang="ts">
import {InputComplex} from '@tweeq/vue'
import {ref} from 'vue'

const opacity = ref({opacity: 10})
const angle = ref({angle: 0})
const color = ref({fill: '#8282ee'})
const booleans = ref({switch: true, checkbox: true})
const position = ref({offset: [0, 0] as [number, number]})
const time = ref({duration: 90})

const numberScheme = {opacity: {type: 'number', min: 0, max: 100, suffix: '%'}} as const
const angleScheme = {angle: {type: 'number', ui: 'angle'}} as const
const colorScheme = {fill: {type: 'string', ui: 'color', alpha: true}} as const
const booleanScheme = {switch: {type: 'boolean'}, checkbox: {type: 'boolean', ui: 'checkbox'}} as const
const positionScheme = {offset: {type: 'vec2', ui: 'position'}} as const
const timeScheme = {duration: {type: 'number', ui: 'time', frameRate: 24, min: 0}} as const

const shadow = ref({offset: [0, 0] as [number, number], blur: 10, spread: 0, color: '#00000030'})
const shadowScheme = {offset: {type: 'vec2', ui: 'position', min: -100, max: 100}, blur: {type: 'number', min: 0, max: 100}, spread: {type: 'number', min: -100, max: 100}, color: {type: 'string', ui: 'color', alpha: true}} as const
const spring = ref({stiffness: 500, damping: 0.5})
const springScheme = {stiffness: {type: 'number', min: 0, max: 1000, clampMin: true, clampMax: true}, damping: {type: 'number', min: 0, max: 1, clampMin: true, clampMax: true}} as const
const timecode = ref({time: 0})
const timecodeScheme = {time: {type: 'number', ui: 'time', min: 0, frameRate: 24}} as const
const lighting = ref({keyIntensity: 100, keyColor: '#ffffff', fillIntensity: 100, fillColor: '#ffffff', backIntensity: 100, backColor: '#ffffff'})
const lightingScheme = {keyIntensity: {type: 'number', min: 0, max: 200, suffix: '%'}, keyColor: {type: 'string', ui: 'color'}, fillIntensity: {type: 'number', min: 0, max: 200, suffix: '%'}, fillColor: {type: 'string', ui: 'color'}, backIntensity: {type: 'number', min: 0, max: 200, suffix: '%'}, backColor: {type: 'string', ui: 'color'}} as const
</script>

<template>
	<main class="research">
		<nav aria-label="Renderer example">
			<a href="../uist2025.html">React</a>
			<strong aria-current="page">Vue</strong>
		</nav>
		<h1>UIST 2025 research demos — Vue</h1>
		<p>These examples use <code>@tweeq/vue</code> directly. The equivalent React examples are available from the documentation page.</p>
		<section>
			<h2>Drag-to-Tweak Interaction and Overlay UI</h2>
			<h3>InputNumber</h3><InputComplex v-model="opacity" :scheme="numberScheme" />
			<h3>Rotary Knobs</h3><InputComplex v-model="angle" :scheme="angleScheme" />
			<h3>Color Inputs</h3><InputComplex v-model="color" :scheme="colorScheme" />
			<h3>Boolean Inputs</h3><InputComplex v-model="booleans" :scheme="booleanScheme" />
			<h3>Position Inputs</h3><InputComplex v-model="position" :scheme="positionScheme" />
			<h3>Timecode Inputs</h3><InputComplex v-model="time" :scheme="timeScheme" />
		</section>
		<section>
			<h2>User Study</h2>
			<h3>Task 1: Drop Shadow</h3><InputComplex v-model="shadow" :scheme="shadowScheme" />
			<h3>Task 2: Spring Simulation</h3><InputComplex v-model="spring" :scheme="springScheme" />
			<h3>Task 3: Timecode</h3><InputComplex v-model="timecode" :scheme="timecodeScheme" />
			<h3>Task 4: Three-Point Lighting</h3><InputComplex v-model="lighting" :scheme="lightingScheme" />
		</section>
	</main>
</template>

<style scoped>
.research { box-sizing: border-box; max-width: 52rem; min-height: 100vh; margin: auto; padding: 2rem; }
nav { display: flex; gap: 1rem; }
section { margin-block: 3rem; }
section :deep(.InputComplex) { max-width: 24rem; }
</style>
