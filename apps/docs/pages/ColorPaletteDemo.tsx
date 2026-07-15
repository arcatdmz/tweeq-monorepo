import {
	buildSemanticColors,
	type ColorMode,
	generateThemeColorsRadix,
	Icon,
	InputColor,
	InputRadio,
	paletteRepresentatives,
	Viewport,
} from '@tweeq/react'
import {useMemo, useState} from 'react'

export function ColorPaletteDemo() {
	const [appearance, setAppearance] = useState<ColorMode>('light')
	const [accent, setAccent] = useState('#3e63dd')
	const [gray, setGray] = useState('#8b8d98')
	const [background, setBackground] = useState('#ffffff')
	const radix = useMemo(
		() => generateThemeColorsRadix({appearance, accent, gray, background}),
		[accent, appearance, background, gray]
	)
	const semantics = useMemo(
		() => buildSemanticColors({background, accent}),
		[accent, background]
	)
	const palette = useMemo(
		() => Object.entries(paletteRepresentatives(accent)),
		[accent]
	)
	const semanticRows = [
		['error / alert / rec', semantics.colorError, semantics.colorErrorSoft],
		['warning', semantics.colorWarning, semantics.colorWarningSoft],
		['success', semantics.colorSuccess, semantics.colorSuccessSoft],
		['info', semantics.colorInfo, semantics.colorInfoSoft],
	] as const

	return (
		<Viewport appId="react-colors" className="ColorPaletteDemo">
			<div className="color-controls">
				<label>
					<span>Appearance</span>
					<InputRadio<ColorMode>
						value={appearance}
						options={['light', 'dark']}
						icons={['mdi:white-balance-sunny', 'mdi:weather-night']}
						renderOption={({label, value}) => (
							<><Icon icon={value === 'light' ? 'mdi:white-balance-sunny' : 'mdi:weather-night'} /><span>{label}</span></>
						)}
						onChange={value => {
							setAppearance(value)
							setBackground(value === 'light' ? '#ffffff' : '#111111')
						}}
					/>
				</label>
				<label><span>Accent</span><InputColor value={accent} onChange={setAccent} /></label>
				<label><span>Gray</span><InputColor value={gray} onChange={setGray} /></label>
				<label><span>Background</span><InputColor value={background} onChange={setBackground} /></label>
			</div>
			<div className="color-preview" style={{background: radix.background, color: radix.grayScale[11]}}>
				<h3>Accent &amp; Gray scales</h3>
				{[radix.accentScale, radix.grayScale].map((scale, row) => (
					<div className="color-scale" key={row}>{scale.map((color, index) => (
						<div className="color-swatch" data-testid="color-swatch" style={{background: color}} key={color}><span>{index + 1}</span></div>
					))}</div>
				))}
				<h3>Semantic colors</h3>
				<div className="semantic-colors">{semanticRows.map(([name, text, soft]) => (
					<div className="semantic-color" style={{background: soft, borderColor: text}} key={name}><b style={{color: text}}>Aa</b><span>{name}</span></div>
				))}</div>
				<h3>Palette</h3>
				<div className="palette-row">{palette.map(([name, color]) => (
					<div className="palette-chip" key={name}><i style={{background: color}} /><span>{name}</span></div>
				))}</div>
			</div>
		</Viewport>
	)
}
