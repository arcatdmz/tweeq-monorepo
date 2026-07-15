import type {ColorMode, Theme} from '@tweeq/core'
import Case from 'case'

/**
 * Promote every theme token to a `--tq-*` CSS custom property on the given
 * root element (numbers become `px`), expose the color mode via
 * `data-color-mode`, and keep the document's `<meta name="theme-color">` in
 * sync with the background. Extracted from the legacy theme store's
 * `watch(theme, …, {immediate: true})` side effect.
 */
export function applyThemeToDOM(
	theme: Theme,
	colorMode: ColorMode,
	rootElement: HTMLElement = document.body
) {
	for (const [key, value] of Object.entries(theme)) {
		const varName = '--tq-' + Case.kebab(key)

		const cssValue = typeof value === 'number' ? `${value}px` : value

		rootElement.style.setProperty(varName, cssValue)
	}

	// Expose the mode for the rare CSS rule that must differ between light
	// and dark beyond what the (already mode-adaptive) tokens give.
	rootElement.dataset.colorMode = colorMode

	const doc = rootElement.ownerDocument

	let metaThemeColor = doc.querySelector('meta[name=theme-color]')

	if (!metaThemeColor) {
		metaThemeColor = doc.createElement('meta')
		metaThemeColor.setAttribute('name', 'theme-color')
		doc.head.appendChild(metaThemeColor)
	}

	metaThemeColor.setAttribute('content', theme.colorBackground)
}
