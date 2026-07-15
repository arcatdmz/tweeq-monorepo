import IndexMarkdown, {frontmatter} from '../../../docs/index.md'
import {assetPath} from '../assetPath'
import {type Page, pageHref, vuePageHref} from '../routes'
import {markdownComponents} from './MarkdownPage'

type HomeAction = {text: string; link: string; type?: 'primary' | 'secondary'}
type HomeFeature = {title: string; details: string}

function actionHref(link: string): string {
	const page = link.replace(/^\//, '') as Page
	return pageHref(page)
}

export function HomePage() {
	const actions = (frontmatter.actions ?? []) as HomeAction[]
	const features = (frontmatter.features ?? []) as HomeFeature[]

	return <>
		<header className="vp-hero">
			<img
				className="vp-hero-image"
				src={assetPath(String(frontmatter.heroImage ?? '/logo.svg').replace(/^\//, ''))}
				alt=""
				height={Number(frontmatter.heroHeight ?? 160)}
			/>
			<h1 id="main-title">Tweeq</h1>
			<p className="vp-hero-description" />
			<p className="vp-hero-actions">
				{actions.map(action => (
					<a
						className={`vp-hero-action-button ${action.type ?? 'primary'}`}
						href={actionHref(action.link)}
						key={action.link}
					>
						{action.text}
					</a>
				))}
			</p>
		</header>
		<div className="vp-features">
			{features.map(feature => (
				<div className="vp-feature" key={feature.title}>
					<h2>{feature.title}</h2>
					<p>{feature.details}</p>
				</div>
			))}
		</div>
		<div {...{'vp-content': ''}} data-testid="home-page">
			<nav className="renderer-gallery-links" aria-label="Renderer galleries">
				<a className="renderer-gallery-link" href={pageHref('all-components')}>
					<strong>React gallery</strong><span>Try every React component</span>
				</a>
				<a className="renderer-gallery-link" href={vuePageHref('all-components')}>
					<strong>Vue gallery</strong><span>Try every Vue component</span>
				</a>
			</nav>
			<IndexMarkdown components={markdownComponents} />
		</div>
	</>
}
