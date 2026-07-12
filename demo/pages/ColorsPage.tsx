import {useMemo, useState} from 'react'

import {buildSemanticColors, type ColorMode,generateThemeColorsRadix, paletteRepresentatives} from '../../src/core'
import {InputColor, InputRadio} from '../../src/react'

export function ColorsPage() {
	const [appearance, setAppearance] = useState<ColorMode>('light')
	const [accent, setAccent] = useState('#3e63dd')
	const [gray, setGray] = useState('#8b8d98')
	const [background, setBackground] = useState('#ffffff')
	const radix = useMemo(() => generateThemeColorsRadix({appearance, accent, gray, background}), [accent, appearance, background, gray])
	const semantics = useMemo(() => buildSemanticColors({background, accent}), [accent, background])
	const palette = useMemo(() => Object.entries(paletteRepresentatives(accent)), [accent])
	const semanticRows = [
		['error / alert / rec', semantics.colorError, semantics.colorErrorSoft],
		['warning', semantics.colorWarning, semantics.colorWarningSoft],
		['success', semantics.colorSuccess, semantics.colorSuccessSoft],
		['info', semantics.colorInfo, semantics.colorInfoSoft],
	] as const

	return (
		<article className="docs-page" data-testid="colors-page">
			<h1>Colors</h1>
			<p>Tweeq's colors are easy to customize: pick an <strong>accent</strong>, <strong>gray</strong>, <strong>background</strong>, and <strong>light/dark</strong>, and the whole UI re-themes to match.</p>
			<p>Beyond the main accent, there's a small <strong>color palette</strong> of distinct hues, and the <strong>semantic colors</strong> (<code>error</code>/<code>alert</code>/<code>rec</code>, <code>warning</code>, <code>success</code>, <code>info</code>) are drawn from it — each leaning toward the accent so everything feels of a piece, while a danger red still reads as red.</p>
			<p>Tweak the inputs below to see it all update live.</p>
			<div className="color-controls">
				<label><span>Appearance</span><InputRadio<ColorMode> value={appearance} options={['light', 'dark']} icons={['mdi:white-balance-sunny', 'mdi:weather-night']} onChange={value => { setAppearance(value); setBackground(value === 'light' ? '#ffffff' : '#111111') }} /></label>
				<label><span>Accent</span><InputColor value={accent} onChange={setAccent} /></label>
				<label><span>Gray</span><InputColor value={gray} onChange={setGray} /></label>
				<label><span>Background</span><InputColor value={background} onChange={setBackground} /></label>
			</div>
			<div className="color-preview" style={{background: radix.background, color: radix.grayScale[11]}}>
				<h2>Accent &amp; Gray scales</h2>
				{[radix.accentScale, radix.grayScale].map((scale, row) => <div className="color-scale" key={row}>{scale.map((color, index) => <div className="color-swatch" data-testid="color-swatch" style={{background: color}} key={color}><span>{index + 1}</span></div>)}</div>)}
				<h2>Semantic colors</h2>
				<div className="semantic-colors">{semanticRows.map(([name, text, soft]) => <div className="semantic-color" style={{background: soft, borderColor: text}} key={name}><b style={{color: text}}>Aa</b><span>{name}</span></div>)}</div>
				<h2>Palette</h2>
				<div className="palette-row">{palette.map(([name, color]) => <div className="palette-chip" key={name}><i style={{background: color}} /><span>{name}</span></div>)}</div>
			</div>
		</article>
	)
}
