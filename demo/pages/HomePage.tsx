import {assetPath} from '../assetPath'
import {Heading} from './docs'

export function HomePage() {
	return <>
		<header className="vp-hero">
			<img
				className="vp-hero-image"
				src={assetPath('logo.svg')}
				alt=""
				height="160"
			/>
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
			<p>Tweeq is a collection of <a href="https://vuejs.org">Vue.js</a> components for creative professionals. The components range from fundamental UIs such as numeric sliders, color pickers, to advanced and niche controls like a cubic-bezier editor. It also supports various micro-interactions suitable for professional use.</p>
			<p>It is continuously developed by the visual artist <a href="https://baku89.com">Baku Hashimoto</a>.</p>
			<Heading level={2} id="how-to-use">How to Use</Heading>
			<Heading level={3} id="installation">Installation</Heading><div className="language-bash"><pre><code>yarn add baku89/tweeq pinia</code></pre></div>
			<Heading level={3} id="index-ts">index.ts</Heading><div className="language-ts"><pre><code>{`import {createPinia} from 'pinia'
import {initTweeq} from 'baku89/tweeq'

app.use(pinia)

initTweeq('com.yourid.yourapp', {
\tcolorMode: 'dark',
\taccentColor: '#ff0000',
})`}</code></pre></div>
			<Heading level={3} id="app-vue">App.vue</Heading><div className="language-ts"><pre><code>{`import {useTweeq} from 'baku89/tweeq'

const Tq = useTweeq()

const projectName = Tq.config.ref('projectName', 'Untitled')
const accentColor = Tq.theme.accentColor`}</code></pre></div>
			<div className="language-html"><pre><code>{`<Tq.App>
  <template #title>
    <Tq.TitleBar name="My App" icon="favicon.svg">
  </template>
  <template #default>
    <Tq.ParameterGrid>
      <Tq.Parameter label="Opacity">
        <Tq.InputNumber v-model="opacity" :min="0" :max="1" />
      </Tq.Parameter>
    </Tq.ParameterGrid>
  </template>
</Tq.App>`}</code></pre></div>
		</div>
	</>
}
