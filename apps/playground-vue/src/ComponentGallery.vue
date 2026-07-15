<script setup lang="ts">
import {
	App,
	Balloon,
	BindIcon,
	ColorIcon,
	GlslCanvas,
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
	InputTextBase,
	InputTime,
	InputTranslate,
	InputVec,
	Markdown,
	Menu,
	type MenuItem,
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
	SvgIcon,
	Tab,
	Tabs,
	Timeline,
	TitleBar,
	Tooltip,
	TweakOverlay,
	Viewport,
	type Scheme,
	useTweeqRuntime,
	vTooltip,
} from '@tweeq/vue'
import {onBeforeUnmount, onMounted, ref, useTemplateRef} from 'vue'

import {
	colorMask,
	paneExpandableIcon,
} from '../../shared/galleryFixtures'

const STAR_PATH =
	'M12 2.5l2.92 5.92 6.53.95-4.72 4.6 1.11 6.5L12 17.67l-5.84 3.08 1.11-6.5-4.72-4.6 6.53-.95L12 2.5z'

const numberValue = ref(25)
const multiFirst = ref(10)
const multiSecond = ref(20)
const stringValue = ref('hello')
const textBaseValue = ref('base text')
const buttonToggleValue = ref(false)
const switchValue = ref(false)
const checkboxValue = ref(false)
const colorValue = ref('#7c3aed')
const angleValue = ref(30)
const codeValue = ref('{\n  "enabled": true\n}')
const monacoValue = ref('const answer = 42')
const bezierValue = ref<[number, number, number, number]>([0.25, 0.1, 0.25, 1])
const dropdownValue = ref('alpha')
const drumValue = ref('Auto')
const positionValue = ref<[number, number]>([10, 20])
const radioValue = ref('alpha')
const rotaryValue = ref(45)
const shuffledValue = ref(1)
const sizeValue = ref<[number, number]>([100, 50])
const timeValue = ref(24)
const translateValue = ref<[number, number]>([0, 0])
const vectorValue = ref<[number, number, number]>([1, 2, 3])
const iconActive = ref(false)
const complexValue = ref({amount: 12, enabled: true, label: 'Demo'})
const complexScheme = {
	amount: {type: 'number', min: 0, max: 100},
	enabled: {type: 'boolean'},
	label: {type: 'string'},
} as const
const modalOpen = ref(false)
const popoverOpen = ref(false)
const overlayOpen = ref(false)
const floatingOpen = ref(false)
const frameWidth = ref(20)
const popoverReference = useTemplateRef<HTMLElement>('popoverReference')
const runtime = useTweeqRuntime()
const modal = runtime.modalStore.getState()
const titleMenuResult = ref('none')
const menuResult = ref('none')
const menuItems: MenuItem[] = [
	{
		label: 'Run command',
		icon: 'char:▶',
		bindIcon: ['⌘', 'R'],
		perform: () => (menuResult.value = 'run'),
	},
	{separator: true},
	{
		label: 'More',
		children: [
			{label: 'Nested command', perform: () => (menuResult.value = 'nested')},
		],
	},
]
let disposeTitleMenu: (() => void) | undefined

onMounted(() => {
	disposeTitleMenu = runtime.actionsStore.getState().register([
		{
			id: 'vue-gallery-run',
			label: 'Run command',
			perform: () => (titleMenuResult.value = 'run'),
		},
		{
			id: 'vue-gallery-more',
			label: 'More',
			children: [
				{
					id: 'vue-gallery-nested',
					label: 'Nested command',
					perform: () => (titleMenuResult.value = 'nested'),
				},
			],
		},
	])
})

onBeforeUnmount(() => disposeTitleMenu?.())
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

const props = withDefaults(defineProps<{embeddedDocs?: boolean}>(), {
	embeddedDocs: false,
})

const docsBase = import.meta.env.DEV
	? 'http://127.0.0.1:5174/'
	: import.meta.env.BASE_URL.replace(/vue\/$/, '')
const reactGalleryHref = `${docsBase}all-components.html`
const componentsHref = props.embeddedDocs
	? `${import.meta.env.BASE_URL}components.html`
	: `${docsBase}components.html`
</script>

<template>
	<main
		class="renderer-gallery-page"
		:class="{'standalone-gallery-page': !embeddedDocs}"
		data-testid="vue-component-gallery"
	>
		<header class="gallery-header">
			<h1>All Components</h1>
			<p>
				This exhaustive gallery contains every component in this renderer. For
				the documented, selected set with usage notes, see the
				<a :href="componentsHref">Components page</a>.
			</p>
			<nav class="renderer-switcher" aria-label="Renderer comparison">
				<a :href="reactGalleryHref">React gallery</a>
				<a href="./" aria-current="page">Vue gallery</a>
			</nav>
		</header>

		<Viewport class="all-components">

		<section data-gallery-component="App">
			<h2>App</h2>
			<App app-id="gallery-embedded" :with-provider="false" embedded>
				<template #title><TitleBar name="Embedded App" :icon="colorMask" style="position: absolute" /></template>
				Embedded application content
			</App>
		</section>

		<section data-gallery-component="Balloon">
			<h2>Balloon</h2>
			<Balloon arrow-side="top" :arrow-offset="36">Balloon content</Balloon>
		</section>

		<section data-gallery-component="BindIcon">
			<h2>BindIcon</h2>
			<BindIcon :icon="['⌘', '+', 'K']" />
		</section>

		<section data-gallery-component="ColorIcon">
			<h2>ColorIcon</h2>
			<ColorIcon :src="colorMask" style="width: 24px" />
		</section>

		<section data-gallery-component="GlslCanvas">
			<h2>GlslCanvas</h2>
			<GlslCanvas style="width: 160px; height: 48px" />
		</section>

		<section data-gallery-component="Icon">
			<h2>Icon</h2>
			<Icon icon="char:★" />
			<Icon data-testid="iconify-icon" icon="material-symbols:diamond" />
			<Icon data-testid="fill-icon" :icon="`fill:${STAR_PATH}`" />
			<Icon data-testid="char-icon" icon="char:⌘" />
		</section>

		<section data-gallery-component="IconIndicator">
			<h2>IconIndicator</h2>
			<IconIndicator v-model:active="iconActive" icon="char:●" />
		</section>

		<section data-gallery-component="InputAngle">
			<h2>InputAngle</h2>
			<InputAngle v-model="angleValue" />
		</section>

		<section data-gallery-component="InputButton">
			<h2>InputButton</h2>
			<InputButton
				label="Run action"
				icon="char:+"
				tooltip="Run the demo action"
			/>
		</section>

		<section data-gallery-component="InputButtonToggle">
			<h2>InputButtonToggle</h2>
			<InputButtonToggle v-model="buttonToggleValue" label="Toggle button" />
		</section>

		<section data-gallery-component="InputCheckbox">
			<h2>InputCheckbox</h2>
			<InputCheckbox v-model="checkboxValue" label="Checkbox" />
		</section>

		<section data-gallery-component="InputCode">
			<h2>InputCode</h2>
			<InputCode v-model="codeValue" lang="json" />
		</section>

		<section data-gallery-component="InputColor">
			<h2>InputColor</h2>
			<div style="width: min(360px, 100%)">
				<InputColor v-model="colorValue" :presets="['#00ff88']" alpha />
			</div>
		</section>

		<section data-gallery-component="InputComplex">
			<h2>InputComplex</h2>
			<InputComplex
				v-model="complexValue"
				:scheme="complexScheme"
				title="Generated form"
			/>
		</section>

		<section data-gallery-component="InputCubicBezier">
			<h2>InputCubicBezier</h2>
			<InputCubicBezier v-model="bezierValue" />
		</section>

		<section data-gallery-component="InputDropdown">
			<h2>InputDropdown</h2>
			<InputDropdown
				v-model="dropdownValue"
				:options="['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa']"
				:labelizer="option => option.replace(/^./, letter => letter.toUpperCase())"
			/>
		</section>

		<section data-gallery-component="InputDrum">
			<h2>InputDrum</h2>
			<InputDrum
				v-model="drumValue"
				:options="['Auto', '100', '200', '400']"
				:cell-width="52"
				font="numeric"
			/>
		</section>

		<section data-gallery-component="InputGroup">
			<h2>InputGroup</h2>
			<InputGroup>
				<button data-inline-position="start">A</button>
				<button data-inline-position="middle">B</button>
				<button data-inline-position="end">C</button>
			</InputGroup>
		</section>

		<section data-gallery-component="InputNumber">
			<h2>InputNumber</h2>
			<InputNumber
				v-model="numberValue"
				:min="0"
				:max="100"
				:step="1"
				prefix="$"
			/>
		</section>

		<section data-gallery-component="InputPosition">
			<h2>InputPosition</h2>
			<InputPosition v-model="positionValue" />
		</section>

		<section data-gallery-component="InputRadio">
			<h2>InputRadio</h2>
			<InputRadio v-model="radioValue" :options="['alpha', 'beta', 'gamma']" />
		</section>

		<section data-gallery-component="InputRotary">
			<h2>InputRotary</h2>
			<InputRotary v-model="rotaryValue" />
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
			<InputString v-model="stringValue" default="hello" />
		</section>

		<section data-gallery-component="InputSwitch">
			<h2>InputSwitch</h2>
			<InputSwitch v-model="switchValue" label="Switch" />
		</section>

		<section data-gallery-component="InputTextBase">
			<h2>InputTextBase</h2>
			<InputTextBase
				v-model="textBaseValue"
				default="base text"
				left-icon="char:T"
				@reset="textBaseValue = 'base text'"
			/>
			<output>{{ textBaseValue }}</output>
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
			<InputVec v-model="vectorValue" :icon="['char:X', 'char:Y', 'char:Z']" />
		</section>

		<section data-gallery-component="Markdown">
			<h2>Markdown</h2>
			<Markdown :source="'# Rendered heading\n\nA [Tweeq](https://example.com) link.'" />
		</section>

		<section data-gallery-component="Menu">
			<h2>Menu</h2>
			<Menu :items="menuItems" />
			<output data-testid="menu-result">{{ menuResult }}</output>
		</section>

		<section data-gallery-component="MonacoEditor">
			<h2>MonacoEditor</h2>
			<MonacoEditor v-model="monacoValue" lang="typescript" style="height: 180px" />
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
			<PaneExpandable :icon="paneExpandableIcon" persistent>
				<div data-testid="expandable-content">Expandable content</div>
			</PaneExpandable>
		</section>

		<section data-gallery-component="PaneFloating">
			<h2>PaneFloating</h2>
			<InputButton label="Toggle floating pane" @click="floatingOpen = !floatingOpen" />
			<PaneFloating
				v-if="floatingOpen"
				name="gallery-floating-relative"
				:position="{anchor: 'right-top', width: 280, height: 120}"
				style="position: relative; inset: auto; margin-top: 0.75rem"
			>
				Floating pane
			</PaneFloating>
		</section>

		<section data-gallery-component="PaneModal">
			<h2>PaneModal</h2>
			<InputButton label="Open plain modal" @click="modalOpen = true" />
			<PaneModal :open="modalOpen">
				<div>Plain modal content</div>
				<InputButton label="Close plain modal" @click="modalOpen = false" />
			</PaneModal>
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
			<div style="width: min(360px, 100%); height: 140px">
				<PaneSplit name="vue-gallery-split" direction="horizontal">
					<template #first><div>First pane</div></template><template #second><div>Second pane</div></template>
				</PaneSplit>
			</div>
		</section>

		<section data-gallery-component="PaneZUI">
			<h2>PaneZUI</h2>
			<div style="width: min(360px, 100%); height: 140px">
				<PaneZUI background="dots"><button type="button">Canvas node</button></PaneZUI>
			</div>
		</section>

		<section data-gallery-component="ParameterGrid">
			<h2>ParameterGrid family</h2>
			<ParameterGrid>
				<ParameterHeading>
					Parameters<template #right>Ready</template>
				</ParameterHeading>
				<Parameter
					label="Name"
					hint="A controlled name"
				><InputString model-value="Tweeq" /></Parameter>
				<ParameterGroup name="demo-advanced" label="Advanced">
					<Parameter label="Mode"><InputString model-value="Detailed" /></Parameter>
				</ParameterGroup>
			</ParameterGrid>
		</section>

		<section data-gallery-component="Popover">
			<h2>Popover</h2>
			<button ref="popoverReference" type="button" @click="popoverOpen = !popoverOpen">Toggle popover</button>
			<Popover v-model:open="popoverOpen" :reference="popoverReference" arrow placement="bottom">
				<div data-testid="popover-content">Popover content</div>
			</Popover>
		</section>

		<section data-gallery-component="Ruler">
			<h2>Ruler</h2>
			<Ruler :range="[0, 10]" style="height: 32px" />
		</section>

		<section data-gallery-component="SvgIcon">
			<h2>SvgIcon</h2>
			<SvgIcon :non-stroke-scaling="true" :stroke-width="3">
				<circle cx="16" cy="16" r="10" />
			</SvgIcon>
		</section>

		<section data-gallery-component="Tabs">
			<h2>Tabs / Tab</h2>
			<Tabs name="vue-gallery-tabs"><Tab name="First">First panel</Tab><Tab name="Second">Second panel</Tab></Tabs>
		</section>

		<section data-gallery-component="Timeline">
			<h2>Timeline</h2>
			<Timeline v-model:frame-width="frameWidth" :frame-range="[0, 120]" style="height: 80px">
				<template #default="{visibleFrameRange}"><div>{{ JSON.stringify(visibleFrameRange) }}</div></template>
			</Timeline>
		</section>

		<section data-gallery-component="TitleBar">
			<h2>TitleBar</h2>
			<TitleBar name="Gallery" :icon="colorMask" style="position: relative">
				<template #center>Center</template><template #right>Right</template>
			</TitleBar>
			<output data-testid="title-menu-result">{{ titleMenuResult }}</output>
		</section>

		<section data-gallery-component="Tooltip">
			<h2>Tooltip</h2>
			<Tooltip>Tooltip presentation surface</Tooltip>
			<button
				type="button"
				v-tooltip="{title: 'Hover help', description: 'Shared tooltip root'}"
			>Hover for tooltip</button>
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

		<section data-gallery-component="Viewport">
			<h2>Viewport</h2><Viewport>Viewport content</Viewport>
		</section>

		<section data-gallery-component="CommandPalette">
			<h2>CommandPalette</h2>
			<p>Press Command/Ctrl+P and run “Increment demo counter”.</p>
			<output data-testid="palette-value">0</output>
		</section>

		<section data-gallery-component="TweeqProvider">
			<h2>TweeqProvider</h2><p>The gallery's outer runtime owner.</p>
		</section>
		</Viewport>
	</main>
</template>
