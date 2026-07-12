export function HomePage() {
	return <article className="docs-page home-page" data-testid="home-page">
		<section className="hero"><img src="/logo.svg" alt="Tweeq logo" /><h1>Tweeq</h1><div className="hero-actions"><a href="#/components">Components</a><a href="#/features">Features</a><a href="#/example">Example</a><a href="https://dl.acm.org/doi/10.1145/3746059.3747734">UIST 2025 Paper</a></div></section>
		<div className="feature-grid">{[
			['Specialized Inputs for Creators', 'Tweeq offers a suite of specialized input components tailored for professional creative applications.'],
			['Drag-to-tweak Interaction', 'Components support various types of micro-interactions, including direct drag gestures for precise and quick parameter adjustments.'],
			['Simultaneous Editing', 'Select and edit multiple parameters parametrically at once.'],
			['Expression Support', 'Control parameters dynamically through JavaScript expressions.'],
			['Peer-Reviewed Research', "Accepted at UIST 2025, demonstrating the academic rigor and practical value of Tweeq's design principles."],
		].map(([title, details]) => <section key={title}><h2 id={title.toLowerCase().replace(/[^a-z]+/g, '-')}>{title}</h2><p>{details}</p></section>)}</div>
		<p>Tweeq is a collection of <a href="https://vuejs.org">Vue.js</a> components for creative professionals. The components range from fundamental UIs such as numeric sliders, color pickers, to advanced and niche controls like a cubic-bezier editor. It also supports various micro-interactions suitable for professional use.</p>
		<p>It is continuously developed by the visual artist <a href="https://baku89.com">Baku Hashimoto</a>.</p>
		<h2 id="how-to-use">How to Use</h2><h3>Installation</h3><pre><code>yarn add baku89/tweeq pinia</code></pre>
		<h3>index.ts</h3><pre><code>{`import {createPinia} from 'pinia'
import {initTweeq} from 'baku89/tweeq'

app.use(pinia)

initTweeq('com.yourid.yourapp', {
  colorMode: 'dark',
  accentColor: '#ff0000',
})`}</code></pre>
		<h3>App.vue</h3><pre><code>{`import {useTweeq} from 'baku89/tweeq'

const Tq = useTweeq()

const projectName = Tq.config.ref('projectName', 'Untitled')
const accentColor = Tq.theme.accentColor`}</code></pre><pre><code>{`<Tq.App>
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
</Tq.App>`}</code></pre>
	</article>
}
