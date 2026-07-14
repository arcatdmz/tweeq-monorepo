<script setup lang="ts">
import {
	App,
	Balloon,
	ColorIcon,
	Icon,
	IconIndicator,
	InputAngle,
	InputButton,
	InputButtonToggle,
	InputCheckbox,
	InputCode,
	InputColor,
	InputComplex,
	InputCubicBezier,
	InputDropdown,
	InputDrum,
	InputGroup,
	InputNumber,
	InputPosition,
	InputRadio,
	InputRotary,
	InputShuffle,
	InputSize,
	InputString,
	InputSwitch,
	InputTime,
	InputTranslate,
	InputVec,
	Markdown,
	MonacoEditor,
	PaneExpandable,
	PaneFloating,
	PaneModal,
	PaneSplit,
	PaneZUI,
	Parameter,
	ParameterGrid,
	ParameterGroup,
	ParameterHeading,
	Popover,
	Ruler,
	Tab,
	Tabs,
	Timeline,
	TitleBar,
	Tooltip,
	TweakOverlay,
	type Scheme,
	useTweeqRuntime,
} from '@tweeq/vue'
import {ref, useTemplateRef} from 'vue'

const numberValue = ref(24)
const multiFirst = ref(10)
const multiSecond = ref(20)
const stringValue = ref('tweeq')
const booleanValue = ref(true)
const checkboxValue = ref(false)
const colorValue = ref('#ff6633')
const angleValue = ref(45)
const codeValue = ref('const value = 24')
const bezierValue = ref<[number, number, number, number]>([0.25, 0.1, 0.25, 1])
const dropdownValue = ref('apple')
const drumValue = ref('one')
const positionValue = ref<[number, number]>([12, 24])
const radioValue = ref('medium')
const rotaryValue = ref(90)
const shuffledValue = ref(1)
const sizeValue = ref<[number, number]>([1920, 1080])
const timeValue = ref(72)
const translateValue = ref<[number, number]>([8, 16])
const vectorValue = ref<[number, number, number]>([1, 2, 3])
const iconActive = ref(true)
const complexValue = ref({opacity: 50, label: 'Layer'})
const complexScheme = {
	opacity: {type: 'number', min: 0, max: 100, suffix: '%'},
	label: {type: 'string'},
} as const
const modalOpen = ref(false)
const popoverOpen = ref(false)
const overlayOpen = ref(false)
const floatingOpen = ref(false)
const frameWidth = ref(24)
const popoverReference = useTemplateRef<HTMLElement>('popoverReference')
const modal = useTweeqRuntime().modalStore.getState()
const modalComplexResult = ref('not opened')
const modalTabsResult = ref('not opened')
const modalTabSpeed = ref(3)

type ModalValue = {name: string; count: number}
const modalComplexScheme: Scheme<ModalValue> = {
	name: {type: 'string'},
	count: {type: 'number', min: 0},
}
const modalTabsScheme: Scheme<{speed: number}> = {
	speed: {type: 'number', min: 0},
}

function openComplexModal() {
	void modal
		.prompt(
			{name: 'Initial', count: 2},
			modalComplexScheme,
			{title: 'Edit values'},
		)
		.then(value => {
			modalComplexResult.value = value ? value.name : 'cancelled'
		})
}

function openTabbedModal() {
	void modal
		.promptTabs(
			[
				{
					id: 'motion',
					title: 'Motion',
					value: {speed: modalTabSpeed.value},
					scheme: modalTabsScheme,
					onInput(value) {
						modalTabSpeed.value = value.speed
					},
				},
			],
			{title: 'Tabbed settings'},
		)
		.then(() => {
			modalTabsResult.value = `closed at ${modalTabSpeed.value}`
		})
}

const docsBase = import.meta.env.DEV
	? 'http://127.0.0.1:5174/'
	: import.meta.env.BASE_URL.replace(/vue\/$/, '')
const homeHref = docsBase
const reactGalleryHref = `${docsBase}#/all-components`

const colorMask =
	'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%3E%3Ccircle%20cx=%2212%22%20cy=%2212%22%20r=%2210%22%20fill=%22black%22/%3E%3C/svg%3E'
</script>

<template>
	<main class="gallery" data-testid="vue-component-gallery">
		<header class="playground-header">
			<a :href="homeHref">← Tweeq home</a>
			<h1>Tweeq Vue component gallery</h1>
			<p>
				Every public component module is represented here. Use the matching
				React gallery to compare the same controls and behaviors.
			</p>
			<nav class="renderer-switcher" aria-label="Renderer comparison">
				<a :href="reactGalleryHref">React gallery</a>
				<a href="./" aria-current="page">Vue gallery</a>
			</nav>
		</header>

		<section data-gallery-component="App">
			<h2>App</h2>
			<App app-id="vue-gallery-embedded" :with-provider="false" embedded>
				<template #title><TitleBar name="Embedded App" :icon="colorMask" style="position: absolute" /></template>
				Embedded application content
			</App>
		</section>

		<section data-gallery-component="Balloon">
			<h2>Balloon</h2>
			<Balloon arrow-side="top" :arrow-offset="36">Balloon content</Balloon>
		</section>

		<section data-gallery-component="ColorIcon">
			<h2>ColorIcon</h2>
			<ColorIcon :src="colorMask" style="width: 24px; height: 24px; background: #f06" />
		</section>

		<section data-gallery-component="CommandPalette">
			<h2>CommandPalette</h2>
			<p>The provider-managed palette is mounted; press Ctrl/Cmd+P to open it.</p>
		</section>

		<section data-gallery-component="Icon">
			<h2>Icon</h2>
			<Icon icon="char:★" />
		</section>

		<section data-gallery-component="IconIndicator">
			<h2>IconIndicator</h2>
			<IconIndicator v-model:active="iconActive" icon="char:★" />
		</section>

		<section data-gallery-component="InputAngle">
			<h2>InputAngle</h2>
			<InputAngle v-model="angleValue" :snap="15" />
		</section>

		<section data-gallery-component="InputButton">
			<h2>InputButton</h2>
			<InputButton label="Action" icon="char:★" />
		</section>

		<section data-gallery-component="InputButtonToggle">
			<h2>InputButtonToggle</h2>
			<InputButtonToggle v-model="booleanValue" label="Toggle" />
		</section>

		<section data-gallery-component="InputCheckbox">
			<h2>InputCheckbox</h2>
			<InputCheckbox v-model="checkboxValue" label="Checked" />
		</section>

		<section data-gallery-component="InputCode">
			<h2>InputCode</h2>
			<InputCode v-model="codeValue" lang="javascript" />
		</section>

		<section data-gallery-component="InputColor">
			<h2>InputColor</h2>
			<InputColor v-model="colorValue" alpha />
		</section>

		<section data-gallery-component="InputComplex">
			<h2>InputComplex</h2>
			<InputComplex v-model="complexValue" :scheme="complexScheme" />
		</section>

		<section data-gallery-component="InputCubicBezier">
			<h2>InputCubicBezier</h2>
			<InputCubicBezier v-model="bezierValue" />
		</section>

		<section data-gallery-component="InputDropdown">
			<h2>InputDropdown</h2>
			<InputDropdown v-model="dropdownValue" :options="['apple', 'banana', 'cherry']" />
		</section>

		<section data-gallery-component="InputDrum">
			<h2>InputDrum</h2>
			<InputDrum v-model="drumValue" :options="['one', 'two', 'three']" />
		</section>

		<section data-gallery-component="InputGroup">
			<h2>InputGroup</h2>
			<InputGroup><InputButton label="One" /><InputButton label="Two" /></InputGroup>
		</section>

		<section data-gallery-component="InputNumber">
			<h2>InputNumber</h2>
			<InputNumber v-model="numberValue" :min="0" :max="100" />
		</section>

		<section data-gallery-component="InputPosition">
			<h2>InputPosition</h2>
			<InputPosition v-model="positionValue" :min="-100" :max="100" />
		</section>

		<section data-gallery-component="InputRadio">
			<h2>InputRadio</h2>
			<InputRadio v-model="radioValue" :options="['small', 'medium', 'large']" />
		</section>

		<section data-gallery-component="InputRotary">
			<h2>InputRotary</h2>
			<InputRotary v-model="rotaryValue" :snap="15" />
		</section>

		<section data-gallery-component="InputShuffle">
			<h2>InputShuffle</h2>
			<InputShuffle v-model="shuffledValue" :generate="value => value + 1" />
		</section>

		<section data-gallery-component="InputSize">
			<h2>InputSize</h2>
			<InputSize v-model="sizeValue" />
		</section>

		<section data-gallery-component="InputString">
			<h2>InputString</h2>
			<InputString v-model="stringValue" />
		</section>

		<section data-gallery-component="InputSwitch">
			<h2>InputSwitch</h2>
			<InputSwitch v-model="booleanValue" label="Enabled" />
		</section>

		<section data-gallery-component="InputTime">
			<h2>InputTime</h2>
			<InputTime v-model="timeValue" :frame-rate="24" />
		</section>

		<section data-gallery-component="InputTranslate">
			<h2>InputTranslate</h2>
			<InputTranslate v-model="translateValue" :min="-100" :max="100" />
		</section>

		<section data-gallery-component="InputVec">
			<h2>InputVec</h2>
			<InputVec v-model="vectorValue" />
		</section>

		<section data-gallery-component="Markdown">
			<h2>Markdown</h2>
			<Markdown source="**Shared** Markdown pipeline" />
		</section>

		<section data-gallery-component="MonacoEditor">
			<h2>MonacoEditor</h2>
			<MonacoEditor v-model="codeValue" lang="javascript" style="height: 10rem" />
		</section>

		<section data-gallery-component="MultiSelectPopup">
			<h2>MultiSelectPopup</h2>
			<p>Hold Command/Ctrl while focusing both inputs to edit them together.</p>
			<InputNumber v-model="multiFirst" />
			<InputNumber v-model="multiSecond" />
			<output data-testid="vue-multi-select-value">{{ multiFirst }},{{ multiSecond }}</output>
		</section>

		<section data-gallery-component="PaneExpandable">
			<h2>PaneExpandable</h2>
			<PaneExpandable icon="char:⚙" open-icon="char:×" persistent>
				<div data-testid="expandable-content">Expandable content</div>
			</PaneExpandable>
		</section>

		<section data-gallery-component="PaneFloating">
			<h2>PaneFloating</h2>
			<InputButton label="Toggle floating pane" @click="floatingOpen = !floatingOpen" />
			<PaneFloating
				v-if="floatingOpen"
				name="vue-gallery-floating-relative"
				:position="{anchor: 'right-top', width: 280, height: 120}"
				style="position: relative; inset: auto; margin-top: 0.75rem"
			>
				Floating pane
			</PaneFloating>
		</section>

		<section data-gallery-component="PaneModal">
			<h2>PaneModal</h2>
			<InputButton label="Toggle modal" @click="modalOpen = !modalOpen" />
			<PaneModal :open="modalOpen"><InputButton label="Close" @click="modalOpen = false" /></PaneModal>
		</section>

		<section data-gallery-component="PaneModalComplex">
			<h2>PaneModalComplex</h2>
			<InputButton label="Open generated modal" @click="openComplexModal" />
			<output data-testid="modal-complex-value">{{ modalComplexResult }}</output>
		</section>

		<section data-gallery-component="PaneModalTabs">
			<h2>PaneModalTabs</h2>
			<InputButton label="Open tabbed modal" @click="openTabbedModal" />
			<output data-testid="modal-tabs-value">{{ modalTabsResult }}</output>
		</section>

		<section data-gallery-component="PaneSplit">
			<h2>PaneSplit</h2>
			<PaneSplit name="vue-gallery-split" direction="horizontal" style="height: 8rem">
				<template #first>First pane</template><template #second>Second pane</template>
			</PaneSplit>
		</section>

		<section data-gallery-component="PaneZUI">
			<h2>PaneZUI</h2>
			<PaneZUI background="dots" style="height: 10rem"><div>Zoomable content</div></PaneZUI>
		</section>

		<section data-gallery-component="ParameterGrid">
			<h2>ParameterGrid family</h2>
			<ParameterGrid>
				<ParameterHeading data-gallery-component="ParameterHeading">Parameters</ParameterHeading>
				<ParameterGroup name="gallery" label="Group" data-gallery-component="ParameterGroup">
					<Parameter label="Value" data-gallery-component="Parameter"><InputNumber v-model="numberValue" /></Parameter>
				</ParameterGroup>
			</ParameterGrid>
		</section>

		<section data-gallery-component="Popover">
			<h2>Popover</h2>
			<button ref="popoverReference" type="button" @click="popoverOpen = !popoverOpen">Toggle popover</button>
			<Popover v-model:open="popoverOpen" :reference="popoverReference">Popover content</Popover>
		</section>

		<section data-gallery-component="Ruler">
			<h2>Ruler</h2>
			<Ruler :range="[0, 100]" />
		</section>

		<section data-gallery-component="Tabs">
			<h2>Tabs</h2>
			<Tabs name="vue-gallery-tabs"><Tab name="First" data-gallery-component="Tab">First tab</Tab><Tab name="Second">Second tab</Tab></Tabs>
		</section>

		<section data-gallery-component="Timeline">
			<h2>Timeline</h2>
			<Timeline v-model:frame-width="frameWidth" :frame-range="[0, 240]" style="height: 8rem" />
		</section>

		<section data-gallery-component="TitleBar">
			<h2>TitleBar</h2>
			<TitleBar name="Vue gallery" :icon="colorMask" style="position: relative" />
		</section>

		<section data-gallery-component="Tooltip">
			<h2>Tooltip</h2>
			<Tooltip>Tooltip presentation surface</Tooltip>
		</section>

		<section data-gallery-component="TweakOverlay">
			<h2>TweakOverlay</h2>
			<button
				type="button"
				data-testid="tweak-overlay-trigger"
				@pointerdown="overlayOpen = true"
				@pointerup="overlayOpen = false"
				@pointercancel="overlayOpen = false"
				@pointerleave="overlayOpen = false"
			>
				Hold to show overlay
			</button>
			<TweakOverlay v-if="overlayOpen" data-testid="tweak-overlay">
				<div data-testid="tweak-overlay-content">Intentional tweak gesture overlay</div>
			</TweakOverlay>
		</section>

		<section data-gallery-component="TweeqProvider">
			<h2>TweeqProvider</h2><p>The gallery's outer runtime owner.</p>
		</section>
		<section data-gallery-component="Viewport">
			<h2>Viewport</h2><p>The gallery's outer canonical style root.</p>
		</section>
	</main>
</template>

<style scoped>
.gallery { box-sizing: border-box; max-width: 960px; min-height: 100vh; margin: auto; padding: 24px 16px 120px; }
.playground-header { padding-bottom: 16px; }
.playground-header h1 { margin: 12px 0 8px; font-family: var(--tq-font-heading, sans-serif); font-size: 28px; font-weight: 700; line-height: 1.2; }
.playground-header p { margin: 0; line-height: 1.5; }
.renderer-switcher { display: inline-flex; gap: 0.25rem; margin-top: 0.5rem; padding: 0.25rem; border: 1px solid var(--tq-color-border); border-radius: 8px; background: var(--tq-color-neutral); }
.renderer-switcher a { padding: 0.45rem 0.8rem; border-radius: 6px; color: var(--tq-color-text); text-decoration: none; }
.renderer-switcher a[aria-current='page'] { background: var(--tq-color-accent); color: var(--tq-color-on-accent); }
.gallery > section { display: grid; gap: 0.75rem; margin-bottom: 16px; }
.gallery h2 { margin: 32px 0 12px; padding-bottom: 8px; border-bottom: 1px solid var(--tq-color-border); font-family: var(--tq-font-heading, sans-serif); font-size: 18px; font-weight: 600; line-height: 1.2; }
.gallery :deep(.TqPaneZUI) { border: 1px solid var(--tq-color-border); }
</style>
