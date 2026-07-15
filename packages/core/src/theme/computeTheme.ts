import {
	buildMonacoTheme,
	buildSemanticColors,
	type MonacoThemeData,
} from './palette.js'
import {generateThemeColorsRadix} from './radix.js'
import type {ColorMode, Theme} from './types.js'

/** The four user-tweakable inputs every other theme token derives from. */
export interface ThemeSettings {
	colorMode: ColorMode
	accentColor: string
	grayColor: string
	backgroundColor: string
}

export interface ComputedTheme {
	theme: Theme
	/**
	 * Monaco editor theme: pure-palette syntax colors (no accent nudge) plus
	 * the app's own background/text/accent. Consumed by InputCode/MonacoEditor.
	 */
	monacoTheme: MonacoThemeData
}

/**
 * Palette computation extracted from the legacy theme store: fits accent +
 * gray scales to the chosen background (the Radix engine), derives semantic
 * colors from the curated palette, and fills in the static metric tokens.
 */
export function computeTheme({
	colorMode,
	accentColor,
	grayColor,
	backgroundColor,
}: ThemeSettings): ComputedTheme {
	// Accent + gray scales, fit to the chosen background (the Radix engine).
	const radix = generateThemeColorsRadix({
		appearance: colorMode,
		background: backgroundColor,
		accent: accentColor,
		gray: grayColor,
	})

	// Semantic colors from the curated palette, nudged toward the accent.
	const semanticColors = buildSemanticColors({
		background: backgroundColor,
		accent: accentColor,
	})

	const dark = colorMode === 'dark'

	const theme: Theme = {
		// Accent
		colorAccent: radix.accentScale[8],
		colorOnAccent: radix.accentContrast,
		colorAccentHover: radix.accentScale[10],
		colorAccentSoft: radix.accentScale[4],
		colorAccentSoftHover: radix.accentScale[5],

		// Background
		colorBackground: radix.background,
		colorText: radix.grayScale[11],
		colorTextMute: radix.grayScale[10],
		colorTextSubtle: radix.grayScale[9],

		// Surface
		colorSurface: `color-mix(in srgb, transparent, ${radix.grayScale[0]} 80%)`,
		colorBorder: radix.grayScaleAlpha[3],
		colorBorderSubtle: radix.grayScaleAlpha[2],
		colorShadow: dark
			? '#000000aa'
			: `color-mix(in srgb, transparent, ${radix.grayScale[11]} 20%)`,

		// Input
		colorInput: radix.grayScale[2],
		colorInputHover: radix.grayScale[3],

		// Neutral: an achromatic filled-button tone. More present than the
		// input/checkbox-off background (grayScale[2]) so it reads as a real
		// button, but without borrowing the accent color.
		colorNeutral: radix.grayScale[4],
		colorNeutralHover: radix.grayScale[5],

		// Selection
		colorSelection: radix.accentScale[10],
		colorOnSelection: radix.background,

		// Semantic Colors (curated palette → see theme/palette.ts)
		...semanticColors,

		fontCode: "'Geist Mono', monospace",
		fontHeading: 'Geist, sans-serif',
		fontUi: 'system-ui, sans-serif',
		fontNumeric: 'Geist, system-ui, sans-serif',

		rem: 12,

		radiusInput: 4,
		// Concentric with the content: inner control radius (4) + popup padding
		// (9), so a popup's corners stay parallel to the controls inside it.
		radiusPopup: 13,
		radiusPane: 12,

		popupWidth: 240,
		popupPadding: 9,
		// Shared backdrop blur for popup surfaces (menus, dropdowns, balloons,
		// tooltips) so they read as the same frosted glass.
		popupBlur: 6,

		iconSize: 18,
		inputHeight: 24,
		// Width at which every input renders its full (non-compact) form
		// comfortably — sized for the most demanding ones (InputColor's hex
		// code, InputVec's side-by-side fields). Hosts that size to content
		// (e.g. a modal form) use it as a min width.
		inputComfortableWidth: 224,

		// Gap scale, named by how related the two things being separated are
		// (tightest → loosest): segments of one control, items that read as a
		// unit (icon + label, a parameter's inputs), independent controls, and
		// whole sections.
		gapGroup: 2,
		gapRelated: 6,
		gapControl: 9,
		gapSection: 18,

		panePadding: 12,
		// Gutter kept between a top-layer pane/modal and the viewport edge
		// when its content would otherwise reach (or overflow) the screen.
		paneMargin: 48,
		scrollbarWidth: 6,

		hoverTransitionDuration: '0.15s',
		activeTransitionDuration: '64ms',
	}

	const monacoTheme = buildMonacoTheme({
		appearance: colorMode,
		background: radix.background,
		accent: accentColor,
		foreground: radix.grayScale[11],
		comment: radix.grayScale[9],
		cursor: radix.accentScale[8],
		selection: radix.accentScale[4],
	})

	return {theme, monacoTheme}
}
