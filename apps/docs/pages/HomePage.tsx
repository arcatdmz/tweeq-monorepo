import {useState} from 'react'

import {assetPath} from '../assetPath'
import {Heading} from './docs'

const reactInstall = 'pnpm add @tweeq/react react react-dom'
const vueInstall = 'pnpm add @tweeq/vue vue'

export function HomePage() {
	const [framework, setFramework] = useState<'react' | 'vue'>('react')
	const react = framework === 'react'

	return <>
		<header className="vp-hero">
			<img className="vp-hero-image" src={assetPath('logo.svg')} alt="" height="160" />
			<h1 id="main-title">Tweeq</h1>
			<p className="vp-hero-description" />
			<p className="vp-hero-actions">
				<a className="vp-hero-action-button primary" href="#/components">Components</a>
				<a className="vp-hero-action-button secondary" href="#/features">Features</a>
				<a className="vp-hero-action-button secondary" href="#/example">Example</a>
				<a className="vp-hero-action-button secondary" href="#/uist2025">UIST 2025 Paper</a>
			</p>
		</header>
		<div className="vp-features">{[
			['Specialized Inputs for Creators', 'Tweeq offers a suite of specialized input components tailored for professional creative applications.'],
			['Drag-to-tweak Interaction', 'Components support various types of micro-interactions, including direct drag gestures for precise and quick parameter adjustments.'],
			['Simultaneous Editing', 'Select and edit multiple parameters parametrically at once.'],
			['Expression Support', 'Control parameters dynamically through JavaScript expressions.'],
			['Peer-Reviewed Research', "Accepted at UIST 2025, demonstrating the academic rigor and practical value of Tweeq's design principles."],
		].map(([title, details]) => <div className="vp-feature" key={title}><h2>{title}</h2><p>{details}</p></div>)}</div>
		<div {...{'vp-content': ''}} data-testid="home-page">
			<div className="badges"><p><a href="http://spdx.org/licenses/MIT"><img src="https://img.shields.io/npm/l/tweeq.svg?style=flat-square" alt="npm license" /></a></p></div>
			<p>This repository maintains <a href="https://react.dev">React</a> and <a href="https://vuejs.org">Vue 3</a> renderers over the shared behavior of <a href="https://github.com/baku89/tweeq">baku89/tweeq</a>, created by visual artist <a href="https://baku89.com">Baku Hashimoto</a>.</p>
			<p>Tweeq provides components for creative professionals, ranging from numeric sliders and color pickers to advanced controls like a cubic-bezier editor, with micro-interactions designed for professional use. Choose a renderer below; each example uses that renderer's public API.</p>
			<Heading level={2} id="how-to-use">How to Use</Heading>
			<div className="framework-switcher" role="group" aria-label="Framework example">
				<button type="button" aria-pressed={react} onClick={() => setFramework('react')}>React</button>
				<button type="button" aria-pressed={!react} onClick={() => setFramework('vue')}>Vue</button>
			</div>
			<Heading level={3} id="installation">Installation</Heading>
			<div className="language-bash"><pre><code>{react ? reactInstall : vueInstall}</code></pre></div>
			{react ? <>
				<Heading level={3} id="main-tsx">main.tsx</Heading>
				<div className="language-ts"><pre><code>{`import {createRoot} from 'react-dom/client'
import '@tweeq/react/style.css'
import {MyApp} from './App'

createRoot(document.getElementById('root')!).render(
  <MyApp />,
)`}</code></pre></div>
				<Heading level={3} id="app-tsx">App.tsx</Heading>
				<div className="language-ts"><pre><code>{`import {useState} from 'react'
import {App, InputNumber, Parameter, ParameterGrid, TitleBar} from '@tweeq/react'

export function MyApp() {
  const [opacity, setOpacity] = useState(1)

  return <App
    appId="com.yourid.yourapp"
    colorMode="dark"
    accentColor="#ff0000"
    title={<TitleBar name="My App" icon="favicon.svg" />}
  >
    <ParameterGrid>
      <Parameter label="Opacity">
        <InputNumber value={opacity} min={0} max={1} onChange={setOpacity} />
      </Parameter>
    </ParameterGrid>
  </App>
}`}</code></pre></div>
			</> : <>
				<Heading level={3} id="main-ts">main.ts</Heading><div className="language-ts"><pre><code>{`import {createApp} from 'vue'
import '@tweeq/vue/style.css'
import Root from './App.vue'

createApp(Root).mount('#app')`}</code></pre></div>
				<Heading level={3} id="app-vue">App.vue</Heading><div className="language-html"><pre><code>{`<script setup lang="ts">
import {ref} from 'vue'
import {App, InputNumber, Parameter, ParameterGrid, TitleBar} from '@tweeq/vue'
const opacity = ref(1)
</script>

<template>
  <App
    app-id="com.yourid.yourapp"
    color-mode="dark"
    accent-color="#ff0000"
  >
    <template #title><TitleBar name="My App" icon="favicon.svg" /></template>
    <ParameterGrid>
      <Parameter label="Opacity">
        <InputNumber v-model="opacity" :min="0" :max="1" />
      </Parameter>
    </ParameterGrid>
  </App>
</template>`}</code></pre></div>
			</>}
		</div>
	</>
}
